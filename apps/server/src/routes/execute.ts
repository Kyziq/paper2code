import { Elysia, t } from "elysia";
import { runDockerContainer } from "~/services/dockerService";
import { BadRequestError } from "~/utils/errors";
import { logger } from "~/utils/logger";
import type { FileExecutionResponse } from "~shared/types";

export const executeRoute = new Elysia().post(
	"/api/execute",
	async ({ body }): Promise<FileExecutionResponse> => {
		const { code } = body;

		if (!code) {
			logger.error("No code provided for execution");
			throw new BadRequestError("No code provided");
		}

		logger.docker("Preparing to execute code");

		try {
			const output = await runDockerContainer(code);
			logger.docker("Execution completed");
			logger.debug(`Execution output:\n${output}`);

			return {
				message: "Code execution successful",
				data: { output },
			};
		} catch (error) {
			logger.error(`Execution failed: ${(error as Error).message}`);
			throw new Error(
				`Error during code execution: ${(error as Error).message}`,
			);
		}
	},
	{
		body: t.Object({
			code: t.String(),
		}),
		type: "json",
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
