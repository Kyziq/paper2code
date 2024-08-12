import axiosInstance from "./axiosInstance";
import { UploadFileResponse, UploadFileParams, ExecuteFileResponse } from "../types";

export const uploadFile = async (params: UploadFileParams): Promise<UploadFileResponse> => {
  const { file, language } = params;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const response = await axiosInstance.post("/ocr", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const executeFile = async (filePath: string): Promise<ExecuteFileResponse> => {
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
};
