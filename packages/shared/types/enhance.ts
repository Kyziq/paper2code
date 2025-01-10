import type { ApiResponse } from ".";

// Input parameters for code enhancement
export interface CodeEnhanceParams {
	code: string;
	language: string;
}

// Response data shape from the enhancement endpoint
export interface CodeEnhanceResponseData {
	enhancedCode: string;
}

// Full response type including message and data
export type CodeEnhanceResponse = ApiResponse<CodeEnhanceResponseData>;

// Optional configuration for enhancement
export interface EnhanceConfig {
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	model?: string;
}
