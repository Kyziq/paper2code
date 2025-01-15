import Groq from "groq-sdk";
import { logger } from "~/utils/logger";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~shared/constants";

const groq = new Groq({
	apiKey: Bun.env.GROQ_API_KEY,
});

const buildPrompt = (code: string): string => {
	const supportedLanguages = SUPPORTED_LANGUAGES.map((lang) => lang.value).join(
		", ",
	);

	return `As an expert in programming language detection, analyze the following code and determine which language it is written in. Our supported languages are: ${supportedLanguages}.

Code to analyze:
${code}

Provide your response in this exact JSON format:
{
  "detectedLanguage": "language_name",
  "confidence": confidence_score
}

Where:
- detectedLanguage is the actual detected language (e.g., "javascript", "python", "dart", etc.)
- confidence score is between 0 and 1

Example: {"detectedLanguage": "javascript", "confidence": 0.95}`;
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

const processResponse = (result: string | undefined) => {
	if (!result) {
		logger.error("No response received from Groq AI");
		return {
			language: null,
			detectedLanguage: "unknown",
			isSupported: false,
			confidence: 0,
		};
	}

	try {
		const detection = JSON.parse(result) as {
			detectedLanguage: string;
			confidence: number;
		};

		// Convert to lowercase for comparison
		const detectedLang = detection.detectedLanguage.toLowerCase();

		// Check if the detected language is supported
		const isSupported = SUPPORTED_LANGUAGES.some(
			(lang) => lang.value === detectedLang,
		);

		logger.info(
			`Language detection result: ${JSON.stringify({
				detected: detectedLang,
				isSupported,
				confidence: detection.confidence,
			})}`,
		);

		return {
			language: isSupported ? (detectedLang as SupportedLanguage) : null,
			detectedLanguage: detectedLang,
			isSupported,
			confidence: detection.confidence,
		};
	} catch (error) {
		logger.error(`Error parsing language detection response: ${error}`);
		return {
			language: null,
			detectedLanguage: "unknown",
			isSupported: false,
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
