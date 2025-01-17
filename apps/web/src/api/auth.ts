import type {
	GoogleVerifyRequest,
	GoogleVerifyResponse,
} from "~shared/types/auth";
import kyInstance from "./kyInstance";

export const verifyGoogleToken = async (
	token: string,
): Promise<GoogleVerifyResponse> => {
	try {
		const request: GoogleVerifyRequest = { token };

		return await kyInstance
			.post("auth/google/verify", {
				json: request,
			})
			.json<GoogleVerifyResponse>();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Google verification failed: ${error.message}`);
		}
		throw new Error("An unknown error occurred during Google verification");
	}
};
