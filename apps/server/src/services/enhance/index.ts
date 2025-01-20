import Groq from "groq-sdk";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";

const groq = new Groq({
	apiKey: Bun.env.GROQ_API_KEY,
});

export async function enhanceCode(
	code: string,
	language: SupportedLanguage,
): Promise<string> {
	if (!code?.trim()) {
		throw new Error("Empty or missing code provided for enhancement");
	}

	try {
		let prompt = `You are an expert programmer for language ${language}. Please only FIX THE SYNTAX and CODE INDENTATION, WHILE MAINTAINING ITS CORE FUNCTIONALITIES. Here's the code:

${code}

Please provide only the improved code without any explanations or markdown formatting.`;

		if (language === "java") {
			prompt += "\nPlease make sure the code has a public class.";
		}

		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "llama-3.3-70b-versatile", // Meta's model. Effective for task like coding assistance
			temperature: 0.3, // 0.3 is a good balance between creativity and accuracy
			max_tokens: 2048,
			top_p: 1,
		});

		const improvedCode = chatCompletion.choices[0]?.message?.content;

		if (!improvedCode) {
			throw new Error("No enhanced code received from AI");
		}

		logger.success("Code enhancement successful");
		return improvedCode.trim();
	} catch (error) {
		logger.error(`Code enhancement failed: ${error}`);
		throw error;
	}
}
