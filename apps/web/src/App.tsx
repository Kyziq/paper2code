import React, { useState } from "react";
import { uploadFile } from "./api";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    try {
      const result = await uploadFile(file);
      setMessage(result);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div>
      <h1>Upload a Python File</h1>
      <input type="file" accept=".py" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;
