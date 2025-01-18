import { Elysia, t } from "elysia";
import { findOrCreateUser } from "~/services/users";
import { logger } from "~/utils/logger";
import type { GoogleUser } from "~shared/types/auth";

export const usersRoute = new Elysia().group("/api/users", (app) =>
	app.post(
		"/",
		async ({ body }) => {
			try {
				const user = await findOrCreateUser(body as GoogleUser);
				return {
					message: "User processed successfully",
					data: user,
				};
			} catch (error) {
				logger.error(`Failed to process user: ${error}`);
				throw error;
			}
		},
		{
			body: t.Object({
				id: t.String(),
				email: t.String(),
				name: t.String(),
				picture: t.Optional(t.String()),
			}),
		},
	),
);
