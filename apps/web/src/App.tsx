import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "./api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/x-python": [".py"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!language) {
      setMessage("Please select a programming language.");
      return;
    }

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    try {
      const result = await uploadFile(file, language);
      setMessage(result);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-4xl h-full bg-white shadow-lg rounded-lg">
        <div className="md:w-1/2 p-6 flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">paper2code</h1>
          <p className="text-gray-600 mb-6">Upload your code and get insights instantly.</p>
          <div className="mb-6">
            <Label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select programming language
            </Label>
            <Select onValueChange={(value) => setLanguage(value)}>
              <SelectTrigger id="language-select" className="w-[260px]">
                <SelectValue placeholder="Select programming language..." />
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
            <Button onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-center items-center bg-gray-50">
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
