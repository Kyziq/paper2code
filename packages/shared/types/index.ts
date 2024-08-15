export interface FileUploadParams {
  file: File;
  language: string;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface FileUploadResponseData {
  uploadedFilePath: string;
}

export type FileUploadResponse = ApiResponse<FileUploadResponseData>;

export interface FileExecutionResponseData {
  output: string;
}

export type FileExecutionResponse = ApiResponse<FileExecutionResponseData>;

export interface ErrorResponse {
  status: 'error';
  message: string;
  statusCode: number;
}
