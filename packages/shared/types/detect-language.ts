import type { ApiResponse } from ".";
import type { SupportedLanguage } from "../constants";

export interface DetectLanguageParams {
	code: string;
}

export interface DetectLanguageResponseData {
	language: SupportedLanguage | null; // null indicates unsupported language
	confidence: number;
}

export type DetectLanguageResponse = ApiResponse<DetectLanguageResponseData>;
