import type { ApiResponse } from ".";
import type { SupportedLanguage } from "../constants";

export interface CodeSnippet {
	id: string;
	userId: string;
	language: SupportedLanguage;
	code: string;
	output: string;
	success: boolean;
	fileUrl?: string;
	createdAt: string;
}

export interface SaveSnippetParams {
	userId: string;
	language: SupportedLanguage;
	code: string;
	output: string;
	success: boolean;
	fileUrl?: string;
}

export type SaveSnippetResponse = ApiResponse<CodeSnippet>;
export type GetSnippetsResponse = ApiResponse<CodeSnippet[]>;
