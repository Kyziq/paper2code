import { OAuth2Client } from "google-auth-library";
import { logger } from "~/utils/logger";
import type { GoogleUser } from "~shared/types/auth";

if (!process.env.GOOGLE_CLIENT_ID) {
	throw new Error("GOOGLE_CLIENT_ID is not set in environment variables");
}

const client = new OAuth2Client({
	clientId: process.env.GOOGLE_CLIENT_ID,
});

export async function verifyGoogleToken(
	token: string,
): Promise<GoogleUser | null> {
	try {
		if (!token) {
			logger.error("No token provided for verification");
			throw new Error("No token provided");
		}

		logger.info("Verifying token with Google...");
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		if (!payload) {
			logger.error("Token verified but no payload received");
			throw new Error("No payload in verified token");
		}

		logger.info("Token verified successfully, processing user data");
		logger.info(`User email: ${payload.email}`);

		const user: GoogleUser = {
			id: payload.sub,
			email: payload.email ?? "",
			name: payload.name ?? "",
			picture: payload.picture ?? "",
		};

		logger.success(`Successfully processed user data for: ${user.email}`);
		return user;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		logger.error(`Failed to verify token: ${errorMessage}`);
		logger.error(`Full error: ${JSON.stringify(error)}`);
		throw error;
	}
}

export async function getGoogleAuthUrl(): Promise<string> {
	const scopes = [
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
		"openid",
	];

	return client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
		include_granted_scopes: true,
	});
}

export async function getGoogleTokens(code: string) {
	if (!code) {
		throw new Error("No authorization code provided");
	}

	try {
		logger.info("Getting tokens from Google...");
		const { tokens } = await client.getToken(code);
		logger.success("Successfully retrieved tokens from Google");
		return tokens;
	} catch (error) {
		logger.error(`Failed to get tokens: ${error}`);
		throw error;
	}
}
