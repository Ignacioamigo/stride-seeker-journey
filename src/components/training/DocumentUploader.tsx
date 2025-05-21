
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { File, Upload, AlertCircle, Check } from "lucide-react";
import { uploadTrainingDocument } from "@/services/planService";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DocumentUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const success = await uploadTrainingDocument(selectedFile);
      
      if (success) {
        setUploadSuccess(true);
        toast({
          title: "Documento subido",
          description: "Tu documento se ha procesado correctamente y se usará para mejorar tus entrenamientos.",
        });
        setSelectedFile(null);
      } else {
        setUploadError("No se pudo procesar el documento. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      setUploadError("Error al subir el documento: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir documentos de entrenamiento</CardTitle>
        <CardDescription>
          Sube documentos, artículos o planes de entrenamiento para mejorar tu plan personalizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription>Documento subido y procesado correctamente</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {selectedFile ? (
                <>
                  <File className="w-8 h-8 mb-2 text-runapp-purple" />
                  <p className="text-sm text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Haz clic para seleccionar</span> o arrastra un archivo
                  </p>
                  <p className="text-xs text-gray-500">PDF, TXT, DOCX o XLSX (Max. 10MB)</p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx,.xlsx"
              onChange={handleFileChange}
            />
          </label>
        </div>
        
        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span> Subiendo...
            </>
          ) : (
            "Subir documento"
          )}
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          Los documentos se utilizan para mejorar las recomendaciones de tu plan de entrenamiento.
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
