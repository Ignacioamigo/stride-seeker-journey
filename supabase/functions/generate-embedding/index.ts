
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
    
    // Call the Embedding API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: { parts: [{ text }] }
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
        
        // Split text into chunks of approximately 1000 characters
        const chunkSize = 1000;
        const textChunks = [];
        
        for (let i = 0; i < text.length; i += chunkSize) {
          const chunk = text.substring(i, i + chunkSize);
          if (chunk.trim()) {
            textChunks.push(chunk);
          }
        }
        
        // Generate and store embeddings for each chunk
        for (let i = 0; i < textChunks.length; i++) {
          const chunkResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'models/embedding-001',
                content: { parts: [{ text: textChunks[i] }] }
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
      } catch (dbError) {
        console.error("Error storing embeddings in database:", dbError);
      }
    }

    return new Response(
      JSON.stringify({ embedding }),
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
