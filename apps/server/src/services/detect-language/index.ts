import Groq from "groq-sdk";
import { logger } from "~/utils/logger";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~shared/constants";
import type { DetectLanguageResponseData } from "~shared/types/detect-language";

const groq = new Groq({
	apiKey: Bun.env.GROQ_API_KEY,
});

const buildPrompt = (code: string): string => {
	const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => lang.value).join(
		", ",
	);

	return `As an expert in programming language detection, analyze the following code and determine which language it is written in. Only respond with the supported languages: ${supportedLanguages}.

Code to analyze:
${code}

Provide your response in this exact JSON format:
{
  "language": "language",
  "confidence": confidence_score
}

Where:
- language should be EXACTLY one of: ${supportedLanguages}, or another detected language name in lowercase
- confidence score is between 0 and 1

Response examples:
{"language": "python", "confidence": 0.95}
{"language": "javascript", "confidence": 0.90}  // even though javascript isn't supported, still indicate what was detected
{"language": "unknown", "confidence": 0}  // when can't detect the language

The response MUST be valid JSON with these exact field names and format.`;
};

const makeGroqRequest = async (prompt: string) => {
	return await groq.chat.completions.create({
		messages: [{ role: "user", content: prompt }],
		model: "llama-3.3-70b-versatile",
		temperature: 0.1,
		max_tokens: 150,
		response_format: { type: "json_object" },
	});
};

const processResponse = (
	result: string | undefined,
): DetectLanguageResponseData => {
	if (!result) {
		logger.error("No response received from Groq AI");
		return {
			language: null,
			confidence: 0,
		};
	}

	try {
		const detection = JSON.parse(result) as {
			language: string;
			confidence: number;
		};
		logger.info(`Raw language detection result: ${JSON.stringify(detection)}`);
		// Convert to lowercase for comparison
		const detectedLang = detection.language.toLowerCase();
		// Check if the detected language is supported
		const supportedLang = SUPPORTED_LANGUAGES.find(
			(lang) => lang.value === detectedLang,
		);

		logger.info(
			`Language detection result: ${JSON.stringify({
				language: supportedLang
					? (supportedLang.value as SupportedLanguage)
					: null,
				confidence: detection.confidence,
			})}`,
		);

		return {
			language: supportedLang
				? (supportedLang.value as SupportedLanguage)
				: null,
			confidence: detection.confidence,
		};
	} catch (error) {
		logger.error(`Error parsing language detection response: ${error}`);
		return {
			language: null,
			confidence: 0,
		};
	}
};

export async function detectLanguage(code: string) {
	try {
		const prompt = buildPrompt(code);
		const completion = await makeGroqRequest(prompt);
		const result = completion.choices[0]?.message?.content ?? undefined;

		return processResponse(result);
	} catch (error) {
		logger.error(`Error in language detection: ${error}`);
		throw error;
	}
}
