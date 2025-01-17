import { Elysia, t } from "elysia";
import {
	getGoogleAuthUrl,
	getGoogleTokens,
	verifyGoogleToken,
} from "~/services/auth";
import { logger } from "~/utils/logger";
import type { GoogleVerifyRequest } from "~shared/types/auth";

export const authRoute = new Elysia().group("/api/auth", (app) =>
	app
		.get("/google/url", async () => {
			try {
				const url = await getGoogleAuthUrl();
				return { url };
			} catch (error) {
				logger.error(`Error generating Google auth URL: ${error}`);
				throw error;
			}
		})

		.get("/google/callback", async ({ query }) => {
			const { code } = query;

			if (!code) {
				throw new Error("No authorization code provided");
			}

			try {
				const tokens = await getGoogleTokens(code);
				if (!tokens.id_token) {
					throw new Error("No ID token received");
				}

				const user = await verifyGoogleToken(tokens.id_token);
				if (!user) {
					throw new Error("Invalid user data");
				}

				return {
					user,
					accessToken: tokens.access_token,
				};
			} catch (error) {
				logger.error(`Error in Google callback: ${error}`);
				throw error;
			}
		})

		.post(
			"/google/verify",
			async ({ body }) => {
				const { token } = body as GoogleVerifyRequest;

				try {
					const user = await verifyGoogleToken(token);
					if (!user) {
						throw new Error("Invalid token");
					}
					return { user };
				} catch (error) {
					logger.error(`Error verifying token: ${error}`);
					throw error;
				}
			},
			{
				body: t.Object({
					token: t.String(),
				}),
			},
		),
);
