import axiosInstance from "./axiosInstance";
import { UploadFileResponse, UploadFileParams, ExecuteFileResponse } from "../types";

// Function to upload a file
export const uploadFile = async (params: UploadFileParams): Promise<UploadFileResponse> => {
  const { file, language } = params;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  try {
    const response = await axiosInstance.post("/ocr", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed.");
  }
};

// Function to execute the file
export const executeFile = async (filePath: string): Promise<ExecuteFileResponse> => {
  try {
    const response = await axiosInstance.post(
      "/execute",
      { filePath },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error executing file:", error);
    throw new Error("File execution failed." + error);
  }
};
