import { Elysia, t } from "elysia";
import Groq from "groq-sdk";
import { BadRequestError } from "~/utils/errors";
import { logger } from "~/utils/logger";
import type {
	CodeEnhanceParams,
	CodeEnhanceResponse,
} from "~shared/types/enhance";

const groq = new Groq({
	apiKey: Bun.env.GROQ_API_KEY,
});

export const enhanceRoute = new Elysia().post(
	"/api/enhance",
	async ({ body }): Promise<CodeEnhanceResponse> => {
		const { code, language } = body as CodeEnhanceParams;

		if (!code?.trim()) {
			logger.error("Empty or missing code provided for enhancement");
			throw new BadRequestError(
				"Empty or missing code provided for enhancement",
			);
		}

		try {
			let prompt = `You are an expert programmer for language ${language}. Please only FIX THE SYNTAX and CODE INDENTATION, WHILE MAINTAINING ITS CORE FUNCTIONALITIES. Here's the code:

${code}

Please provide only the improved code without any explanations or markdown formatting.`;

			if (language === "java") {
				prompt += `
Please make sure the code has a public class.
`;
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
			return {
				message: "Code enhancement successful",
				data: {
					enhancedCode: improvedCode.trim(),
				},
			};
		} catch (error) {
			logger.error(`Code enhancement failed: ${error}`);
			throw error;
		}
	},
	{
		body: t.Object({
			code: t.String(),
			language: t.String(),
		}),
		// Response validation schema
		response: t.Object({
			message: t.String(),
			data: t.Optional(
				t.Object({
					enhancedCode: t.String(),
				}),
			),
		}),
	},
);
