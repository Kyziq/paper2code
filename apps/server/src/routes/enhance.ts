import { Elysia, t } from "elysia";
import { enhanceCode } from "~/services/enhance";
import { BadRequestError } from "~/utils/errors";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";
import type {
	CodeEnhanceParams,
	CodeEnhanceResponse,
} from "~shared/types/enhance";

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
			const enhancedCode = await enhanceCode(
				code,
				language as SupportedLanguage,
			);

			return {
				message: "Code enhancement successful",
				data: {
					enhancedCode,
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
