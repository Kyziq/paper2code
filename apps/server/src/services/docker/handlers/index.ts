import type { SupportedLanguage } from "~shared/constants";
import { cppHandler } from "./cpp";
import { javaHandler } from "./java";
import { pythonHandler } from "./python";

export interface LanguageHandler {
	getServiceName: () => string;
	buildCommand: (encodedContent: string, executionId: string) => string;
}

const handlers = {
	cpp: cppHandler,
	java: javaHandler,
	python: pythonHandler,
} as const;

export const getLanguageHandler = (language: SupportedLanguage) => {
	const handler = handlers[language];
	if (!handler) throw new Error(`Unsupported language: ${language}`);
	return handler;
};
