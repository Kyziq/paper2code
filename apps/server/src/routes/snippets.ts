import { Elysia, t } from "elysia";
import { getUserSnippets, saveCodeSnippet } from "~/services/snippets";
import { logger } from "~/utils/logger";
import type { SaveSnippetParams } from "~shared/types/snippets";

export const snippetsRoute = new Elysia().group("/api/snippets", (app) =>
	app
		.post(
			"/",
			async ({ body }) => {
				try {
					const snippet = await saveCodeSnippet(
						body as Omit<SaveSnippetParams, "user">,
					);
					return {
						message: "Code snippet saved successfully",
						data: snippet,
					};
				} catch (error) {
					logger.error(`Failed to save code snippet: ${error}`);
					throw error;
				}
			},
			{
				body: t.Object({
					userId: t.String(),
					language: t.String(),
					code: t.String(),
					output: t.String(),
					success: t.Boolean(),
					fileUrl: t.Optional(t.String()),
				}),
			},
		)
		.get(
			"/:userId",
			async ({ params: { userId } }) => {
				try {
					const snippets = await getUserSnippets(userId);
					return {
						message: "Code snippets retrieved successfully",
						data: snippets,
					};
				} catch (error) {
					logger.error(`Failed to retrieve code snippets: ${error}`);
					throw error;
				}
			},
			{
				params: t.Object({
					userId: t.String(),
				}),
			},
		),
);
