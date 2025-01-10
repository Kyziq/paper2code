import kyInstance from "~/api/kyInstance";
import type {
	FileExecutionResponse,
	FileUploadParams,
	FileUploadResponse,
} from "~shared/types";
import type {
	CodeEnhanceParams,
	CodeEnhanceResponse,
} from "~shared/types/enhance";

export const uploadFile = async (
	params: FileUploadParams,
): Promise<FileUploadResponse> => {
	const { file, language } = params;
	const formData = new FormData();
	formData.append("file", file);
	formData.append("language", language);

	try {
		return await kyInstance
			.post("ocr", {
				body: formData,
			})
			.json<FileUploadResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw new Error("An unknown error occurred during file upload");
	}
};

export const executeCode = async (
	code: string,
	language: string,
): Promise<FileExecutionResponse> => {
	try {
		return await kyInstance
			.post("execute", {
				json: { code, language },
			})
			.json<FileExecutionResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw new Error("An unknown error occurred during code execution");
	}
};

export const enhanceCode = async (
	params: CodeEnhanceParams,
): Promise<CodeEnhanceResponse> => {
	try {
		return await kyInstance
			.post("enhance", {
				json: params,
			})
			.json<CodeEnhanceResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw new Error("An unknown error occurred during code enhancement");
	}
};
