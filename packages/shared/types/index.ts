export interface FileUploadParams {
	file: File;
	language: string;
}

export interface ApiResponse<T = unknown> {
	message: string;
	data?: T;
}

export interface FileUploadResponseData {
	code: string;
	language: string;
}

export type FileUploadResponse = ApiResponse<FileUploadResponseData>;

export interface FileExecutionParams {
	code: string;
	language: string;
}

export interface FileExecutionResponseData {
	output: string;
}

export type FileExecutionResponse = ApiResponse<FileExecutionResponseData>;

export interface ErrorResponse {
	message: string;
	statusCode: number;
}
