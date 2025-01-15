import type { ApiResponse } from ".";
import type { SupportedLanguage } from "../constants";

export interface DetectLanguageParams {
	code: string;
}

export interface DetectLanguageResponseData {
	language: SupportedLanguage | null; // For supported languages (python, cpp, java)
	detectedLanguage: string; // The actual detected language (e.g., javascript, python, etc.)
	isSupported: boolean; // Whether the detected language is supported
	confidence: number; // Confidence score of detection
}

export type DetectLanguageResponse = ApiResponse<DetectLanguageResponseData>;
