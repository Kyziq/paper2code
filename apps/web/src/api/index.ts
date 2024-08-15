import { FileExecutionResponse, FileUploadParams, FileUploadResponse } from '@shared/types';
import axiosInstance from './axiosInstance';

export const uploadFile = async (params: FileUploadParams): Promise<FileUploadResponse> => {
  const { file, language } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  try {
    const response = await axiosInstance.post<FileUploadResponse>('/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during file upload');
  }
};

export const executeFile = async (filePath: string): Promise<FileExecutionResponse> => {
  try {
    const response = await axiosInstance.post<FileExecutionResponse>(
      '/execute',
      { filePath },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during file execution');
  }
};
