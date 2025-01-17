import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import {
	authRoute,
	detectLanguageRoute,
	enhanceRoute,
	executeRoute,
	ocrRoute,
} from "~/routes";
import { ApiError } from "~/utils/errors";
import { logger } from "~/utils/logger";

export const app = new Elysia()
	.use(cors())
	.use(authRoute)
	.use(ocrRoute)
	.use(executeRoute)
	.use(enhanceRoute)
	.use(detectLanguageRoute)
	.onError(({ error, set }) => {
		if (error instanceof ApiError) {
			set.status = error.statusCode;
			return {
				status: "error",
				statusCode: error.statusCode,
				message: error.message,
			};
		}

		logger.error(`Unexpected error: ${error}`);
		set.status = 500;
		return {
			status: "error",
			statusCode: 500,
			message: "An unexpected error occurred",
		};
	})
	.onRequest(({ request }) => {
		logger.api(`${request.method} ${request.url}`);
	});

app.listen(3000, ({ hostname, port }) => {
	logger.info(`🦊 Elysia is running at http://${hostname}:${port}`);
});
