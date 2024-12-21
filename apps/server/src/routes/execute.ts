import { Elysia, t } from "elysia";
import { runContainer } from "~/services/docker";
import { BadRequestError } from "~/utils/errors";
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
			throw new BadRequestError(
				"[ERROR] Empty or missing code provided for execution",
			);
		}

		const output = await runContainer(code, language as SupportedLanguage);
		logger.success(`Execution output:\n${output}`);
		return {
			message: "Code execution successful",
			data: { output },
		};
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
