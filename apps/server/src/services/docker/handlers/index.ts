import { cppHandler } from "./cpp";
import { javaHandler } from "./java";

const handlers = {
	cpp: cppHandler,
	java: javaHandler,
} as const;

export type SupportedLanguage = keyof typeof handlers;

export const getLanguageHandler = (language: SupportedLanguage) => {
	const handler = handlers[language];
	if (!handler) throw new Error(`Unsupported language: ${language}`);
	return handler;
};
