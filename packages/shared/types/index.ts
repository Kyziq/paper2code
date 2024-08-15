export interface UploadFileParams {
  file: File;
  language: string;
}

export interface UploadFileResponse {
  message: string;
  filePath: string;
}

export interface ExecuteFileResponse {
  executionOutput: string;
  executionError?: string;
}
