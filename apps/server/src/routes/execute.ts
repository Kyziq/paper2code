import path from "node:path";
import { Elysia, t } from "elysia";
import { runDockerContainer } from "~/services/dockerService";
import { BadRequestError } from "~/utils/errors";
import { logger } from "~/utils/logger";
import type { FileExecutionResponse } from "~shared/types";

export const executeRoute = new Elysia().post(
	"/api/execute",
	async ({ body }): Promise<FileExecutionResponse> => {
		const { filePath } = body;

		if (!filePath) {
			logger.error("No file path provided for execution");
			throw new BadRequestError("No file path provided");
		}

		const fileName = path.basename(filePath);
		logger.docker(`Preparing to execute file: ${fileName}`);

		try {
			const output = await runDockerContainer(fileName);
			logger.docker(`Execution completed for ${fileName}`);
			logger.debug(`Execution output:\n${output}`);

			return {
				message: "File execution successful",
				data: { output },
			};
		} catch (error) {
			logger.error(`Execution failed: ${(error as Error).message}`);
			throw new Error(
				`Error during file execution: ${(error as Error).message}`,
			);
		}
	},
	{
		body: t.Object({
			filePath: t.String(),
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
