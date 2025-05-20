
import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RunButton from "@/components/ui/RunButton";
import { uploadTrainingDocument } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const DocumentUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");

  const handleUpload = async () => {
    if (!documentTitle.trim() || !documentContent.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadTrainingDocument(documentTitle, documentContent);
      toast({
        title: "¡Documento subido!",
        description: "Tu documento de entrenamiento ha sido procesado correctamente.",
      });
      // Reset form
      setDocumentTitle("");
      setDocumentContent("");
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el documento. Verifica tu conexión a Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-runapp-purple" />
        <h2 className="text-lg font-semibold text-runapp-navy">Subir documento de entrenamiento</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="document-title">Título del documento</Label>
          <Input
            id="document-title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="Ej: Técnicas de carrera para principiantes"
          />
        </div>
        
        <div>
          <Label htmlFor="document-content">Contenido del documento</Label>
          <Textarea
            id="document-content"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            placeholder="Ingresa el contenido del documento de entrenamiento aquí..."
            className="min-h-[200px]"
          />
        </div>
        
        <RunButton 
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Procesando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir documento
            </>
          )}
        </RunButton>
      </div>
    </div>
  );
};

export default DocumentUploader;
