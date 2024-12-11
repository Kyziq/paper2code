import type { SupportedLanguage } from "~shared/constants";
import { cppHandler } from "./cpp";
import { javaHandler } from "./java";

const handlers = {
	cpp: cppHandler,
	java: javaHandler,
} as const;

export const getLanguageHandler = (language: SupportedLanguage) => {
	const handler = handlers[language];
	if (!handler) throw new Error(`Unsupported language: ${language}`);
	return handler;
};
