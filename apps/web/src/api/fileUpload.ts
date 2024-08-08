// api/fileUpload.ts
import axiosInstance from "./axiosInstance";
import { UploadFileResponse, UploadFileParams } from "../types";

export const uploadFile = async (params: UploadFileParams): Promise<UploadFileResponse> => {
  const { file, language } = params;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  try {
    const response = await axiosInstance.post("/upload", formData, {
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
