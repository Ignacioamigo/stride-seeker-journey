import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, metadata } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing text parameter' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log("Generating embedding for text with length:", text.length);
    
    // Call the Embedding API with the latest model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
          taskType: 'RETRIEVAL_DOCUMENT'
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Embedding API error response:", error);
      throw new Error(`Embedding API error: ${error}`);
    }

    const data = await response.json();
    if (!data.embedding || !data.embedding.values) {
      console.error("Unexpected response format from Embedding API:", data);
      throw new Error("Invalid embedding response format");
    }
    
    const embedding = data.embedding.values;
    console.log("Embedding generated successfully with dimensions:", embedding.length);
    
    // Store the embedding in Supabase if we have metadata
    if (metadata) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        
        // Intelligent text chunking with semantic boundaries
        const textChunks = intelligentChunking(text, metadata);
        
        function intelligentChunking(text: string, metadata: any): string[] {
          const chunks: string[] = [];
          const maxChunkSize = 800; // Optimal size for Gemini embeddings
          const minChunkSize = 200;
          const overlapSize = 100; // Overlap between chunks for context preservation
          
          // First, try to split by semantic boundaries
          const sections = text.split(/\n(?=#+\s|\*\*|##|\d+\.)/); // Headers, bold text, numbered lists
          
          for (const section of sections) {
            if (section.trim().length === 0) continue;
            
            if (section.length <= maxChunkSize) {
              // Section fits in one chunk
              chunks.push(section.trim());
            } else {
              // Section needs to be split further
              const sentences = section.split(/(?<=[.!?])\s+/);
              let currentChunk = '';
              
              for (const sentence of sentences) {
                const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
                
                if (testChunk.length <= maxChunkSize) {
                  currentChunk = testChunk;
                } else {
                  // Current chunk is ready, start new one
                  if (currentChunk.length >= minChunkSize) {
                    chunks.push(currentChunk.trim());
                  }
                  
                  // Add overlap from previous chunk if available
                  const words = currentChunk.split(' ');
                  const overlap = words.slice(-Math.floor(overlapSize / 6)).join(' '); // ~15-20 words overlap
                  
                  currentChunk = overlap + (overlap ? ' ' : '') + sentence;
                }
              }
              
              // Add remaining content
              if (currentChunk.trim().length >= minChunkSize) {
                chunks.push(currentChunk.trim());
              }
            }
          }
          
          // Fallback: if no semantic chunking worked, use character-based
          if (chunks.length === 0) {
            for (let i = 0; i < text.length; i += maxChunkSize - overlapSize) {
              const chunk = text.substring(i, i + maxChunkSize);
              if (chunk.trim()) {
                chunks.push(chunk.trim());
              }
            }
          }
          
          return chunks.filter(chunk => chunk.length >= minChunkSize);
        }
        
        // Generate and store embeddings for each chunk
        for (let i = 0; i < textChunks.length; i++) {
          const chunkResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: { parts: [{ text: textChunks[i] }] },
                taskType: 'RETRIEVAL_DOCUMENT'
              }),
            }
          );
          
          if (!chunkResponse.ok) {
            console.error(`Error generating embedding for chunk ${i}:`, await chunkResponse.text());
            continue;
          }
          
          const chunkData = await chunkResponse.json();
          if (!chunkData.embedding || !chunkData.embedding.values) {
            console.error(`Invalid embedding response format for chunk ${i}`);
            continue;
          }
          
          const chunkEmbedding = chunkData.embedding.values;
          
          // Store in the fragments table
          const { error: insertError } = await supabase
            .from('fragments')
            .insert({
              id: `${metadata.filename || 'document'}-chunk-${i}`,
              content: textChunks[i],
              embedding: chunkEmbedding,
              metadata: {
                ...metadata,
                chunkIndex: i,
                totalChunks: textChunks.length
              }
            });
          
          if (insertError) {
            console.error(`Error storing fragment ${i}:`, insertError);
          } else {
            console.log(`Successfully stored fragment ${i} of ${textChunks.length}`);
          }
        }
        
        console.log(`Stored ${textChunks.length} fragments with embeddings`);
        
        return new Response(
          JSON.stringify({ 
            embedding,
            success: true,
            fragmentsCreated: textChunks.length,
            message: `Successfully stored ${textChunks.length} fragments`
          }),
          { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      } catch (dbError) {
        console.error("Error storing embeddings in database:", dbError);
        return new Response(
          JSON.stringify({ 
            embedding,
            success: false,
            error: dbError.message,
            fragmentsCreated: 0
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        embedding,
        success: true,
        fragmentsCreated: 0,
        message: "Embedding generated without storage (no metadata provided)"
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error in generate-embedding:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
