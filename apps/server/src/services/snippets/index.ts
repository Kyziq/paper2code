// apps/server/src/services/snippets/index.ts

import { desc, eq } from "drizzle-orm";
import { db } from "~/db";
import { codeSnippets } from "~/db/schema";
import { logger } from "~/utils/logger";
import type { SaveSnippetParams } from "~shared/types/snippets";

export async function saveCodeSnippet(
	snippet: Omit<SaveSnippetParams, "user">,
) {
	try {
		const [savedSnippet] = await db
			.insert(codeSnippets)
			.values({
				userId: snippet.userId,
				language: snippet.language,
				code: snippet.code,
				output: snippet.output,
				success: snippet.success,
				fileUrl: snippet.fileUrl,
			})
			.returning();

		logger.success(`Saved code snippet for user: ${snippet.userId}`);
		return savedSnippet;
	} catch (error) {
		logger.error(`Error saving code snippet: ${error}`);
		throw error;
	}
}

export async function getUserSnippets(userId: string) {
	try {
		const snippets = await db.query.codeSnippets.findMany({
			where: eq(codeSnippets.userId, userId),
			orderBy: [desc(codeSnippets.createdAt)],
			with: {
				user: true,
			},
		});

		return snippets;
	} catch (error) {
		logger.error(`Error fetching user snippets: ${error}`);
		throw error;
	}
}
