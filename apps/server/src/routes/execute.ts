import { Elysia, t } from "elysia";
import { runContainer } from "~/services/docker";
import { logger } from "~/utils/logger";
import type { SupportedLanguage } from "~shared/constants";
import type { FileExecutionResponse } from "~shared/types";

export const executeRoute = new Elysia().post(
	"/api/execute",
	async ({ body }): Promise<FileExecutionResponse> => {
		const { code, language } = body;

		// Input validation
		if (!code?.trim()) {
			logger.error("Empty or missing code provided for execution");
			return {
				message: "Code execution failed",
				data: {
					output: "[ERROR] Empty or missing code provided for execution",
				},
			};
		}

		try {
			const result = await runContainer(code, language as SupportedLanguage);
			return {
				message: result.success
					? "Code execution successful"
					: "Code execution failed",
				data: { output: result.output },
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.error(`Error executing code: ${errorMessage}`);
			return {
				message: "Code execution failed",
				data: { output: errorMessage },
			};
		}
	},
	{
		// Request validation schema
		body: t.Object({
			code: t.String(),
			language: t.String(),
		}),
		type: "json",

		// Response validation schema
		response: t.Object({
			message: t.String(),
			data: t.Optional(
				t.Object({
					output: t.String(),
				}),
			),
		}),
	},
);
