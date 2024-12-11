import kyInstance from "~/api/kyInstance";
import type {
	FileExecutionResponse,
	FileUploadParams,
	FileUploadResponse,
} from "~shared/types";

export const uploadFile = async (
	params: FileUploadParams,
): Promise<FileUploadResponse> => {
	const { file, language } = params;
	const formData = new FormData();
	formData.append("file", file);
	formData.append("language", language);

	try {
		const response = await kyInstance
			.post("ocr", {
				body: formData,
			})
			.json<FileUploadResponse>();
		return response;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw new Error("An unknown error occurred during file upload");
	}
};

export const executeFile = async (
	code: string,
	language: string,
): Promise<FileExecutionResponse> => {
	try {
		const response = await kyInstance
			.post("execute", {
				json: { code, language },
			})
			.json<FileExecutionResponse>();
		return response;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw new Error("An unknown error occurred during code execution");
	}
};
