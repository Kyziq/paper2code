// Base Response Types
export interface ApiResponse<T = unknown> {
	message: string;
	data?: T;
}

export interface ErrorResponse {
	message: string;
	statusCode: number;
}

// File Upload Related
export interface FileUploadParams {
	file: File;
	language: string;
}

export interface FileUploadResponseData {
	code: string;
	language: string;
}

export type FileUploadResponse = ApiResponse<FileUploadResponseData>;

// File Execution Related
export interface FileExecutionParams {
	code: string;
	language: string;
}

export interface FileExecutionResponseData {
	output: string;
}

export type FileExecutionResponse = ApiResponse<FileExecutionResponseData>;
