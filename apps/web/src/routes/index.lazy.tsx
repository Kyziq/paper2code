import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Console from "@/components/console";
import { uploadFile, executeFile } from "../api";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { UploadFileParams, UploadFileResponse } from "../types";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  // For managing server state
  // const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const { mutate: uploadMutate, isPending: isUploadPending } = useMutation({
    mutationFn: (data: UploadFileParams) => uploadFile(data),
    onSuccess: (result: UploadFileResponse) => {
      setMessage(result.message);
      toast.success("File uploaded successfully. Proceeding to execution...");
      handleExecute(result.filePath); // Automatically trigger execution after upload
    },
    onError: (error) => {
      const errorMessage = (error as Error).message;
      setMessage(errorMessage);
      toast.error(errorMessage);
    },
  });
  const handleUpload = () => {
    if (!language) return toast.error("Please select a language.");
    if (!file) return toast.error("Please select a file.");
    uploadMutate({ file, language });
  };

  const { mutate: executeMutate, isPending: isExecutePending } = useMutation({
    mutationFn: (filePath: string) => executeFile(filePath),
    onSuccess: (result) => {
      setMessage(result.result);
      toast.success("File executed successfully.");
    },
    onError: (error) => {
      const errorMessage = (error as Error).message;
      setMessage(errorMessage);
      toast.error(errorMessage);
    },
  });
  const handleExecute = (filePath: string) => {
    executeMutate(filePath);
  };

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    multiple: false,
  });
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="md:w-1/2 p-6 flex flex-col ">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">paper2code</h1>
          <p className="text-gray-600">Upload your handwritten code and get insights instantly.</p>
          <div className="mt-6">
            <Label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1 ">
              Programming Language
            </Label>
            <Select onValueChange={(value) => setLanguage(value)}>
              <SelectTrigger id="language-select" className="w-[200px]">
                <SelectValue placeholder="Choose a language..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                {/* TODO: more languages supported */}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-6">
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Code File <span className="text-xs font-normal text-gray-500">(Accepted formats: .png, .jpg, .jpeg)</span>
            </Label>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer w-full bg-gray-50 rounded-lg">
              <input {...getInputProps()} />
              {file ? <p className="text-gray-700">{file.name}</p> : <p className="text-gray-500">Drag 'n' drop your file here, or click to select one</p>}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleUpload} disabled={isUploadPending || isExecutePending}>
              <Upload className="mr-2 h-4 w-4" /> {isUploadPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-center items-center ">
          <Console message={isUploadPending || isExecutePending ? "Processing..." : message} />
        </div>
      </div>
    </div>
  );
}
