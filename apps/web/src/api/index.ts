import { AxiosError } from 'axios';
import { ExecuteFileResponse, UploadFileParams, UploadFileResponse } from '../types';
import axiosInstance from './axiosInstance';

export const uploadFile = async (params: UploadFileParams): Promise<UploadFileResponse> => {
  const { file, language } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  try {
    const response = await axiosInstance.post('/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.message || 'An error occurred while uploading the file');
    }
    throw error;
  }
};

export const executeFile = async (filePath: string): Promise<ExecuteFileResponse> => {
  try {
    const response = await axiosInstance.post<ExecuteFileResponse>(
      '/execute',
      { filePath },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.message || 'An error occurred while executing the file');
    }
    throw error;
  }
};
