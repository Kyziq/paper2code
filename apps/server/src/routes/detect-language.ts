import { Elysia, t } from "elysia";
import { detectLanguage } from "~/services/detect-language";
import { BadRequestError } from "~/utils/errors";
import { logger } from "~/utils/logger";
import type {
	DetectLanguageParams,
	DetectLanguageResponse,
} from "~shared/types/detect-language";

export const detectLanguageRoute = new Elysia().post(
	"/api/detect-language",
	async ({ body }): Promise<DetectLanguageResponse> => {
		const { code } = body as DetectLanguageParams;

		if (!code?.trim()) {
			logger.error("Empty or missing code provided for language detection");
			throw new BadRequestError(
				"Empty or missing code provided for language detection",
			);
		}

		try {
			const result = await detectLanguage(code);

			return {
				message: result.language
					? "Language detection successful"
					: "Could not confidently detect programming language",
				data: {
					language: result.language,
					detectedLanguage: result.detectedLanguage,
					isSupported: result.isSupported,
					confidence: result.confidence,
				},
			};
		} catch (error) {
			logger.error(`Language detection failed: ${error}`);
			throw error;
		}
	},
	{
		body: t.Object({
			code: t.String(),
		}),
		response: t.Object({
			message: t.String(),
			data: t.Optional(
				t.Object({
					language: t.Union([
						t.Literal("python"),
						t.Literal("cpp"),
						t.Literal("java"),
						t.Null(),
					]),
					confidence: t.Number(),
					detectedLanguage: t.String(),
				}),
			),
		}),
	},
);
