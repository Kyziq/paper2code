import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Console from "@/components/console";
import { uploadFile } from "../api";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { UploadFileParams } from "../types";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  // For managing server state
  // const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UploadFileParams) => uploadFile(data),
    onSuccess: (result) => {
      setMessage(result.message);
      toast.success("File uploaded successfully.");
    },
    onError: (error) => {
      const errorMessage = (error as Error).message;
      setMessage(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/x-python": [".py"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!language) return toast.error("Please select a language.");
    if (!file) return toast.error("Please select a file.");
    mutate({ file, language });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="md:w-1/2 p-6 flex flex-col ">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">paper2code</h1>
          <p className="text-gray-600 mb-6">Upload your code and get insights instantly.</p>
          <div className="mb-6">
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
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer w-full bg-gray-50 rounded-lg">
            <input {...getInputProps()} />
            {file ? <p className="text-gray-700">{file.name}</p> : <p className="text-gray-500">Drag 'n' drop your code file here, or click to select one</p>}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleUpload} disabled={isPending}>
              <Upload className="mr-2 h-4 w-4" /> {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-center items-center ">
          <Console message={isPending ? "Executing..." : message} />
        </div>
      </div>
    </div>
  );
}
