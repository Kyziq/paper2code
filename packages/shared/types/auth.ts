import type { ApiResponse } from ".";

// Core user type
export interface GoogleUser {
	id: string;
	email: string;
	name: string;
	picture: string;
	locale: string;
}

// Request/Response types
export interface GoogleAuthUrlResponse extends ApiResponse<{ url: string }> {}

export interface GoogleCallbackRequest {
	code: string;
}

export interface GoogleCallbackResponse
	extends ApiResponse<{
		user: GoogleUser;
		accessToken: string;
	}> {}

export interface GoogleVerifyRequest {
	token: string;
}

export interface GoogleVerifyResponse
	extends ApiResponse<{
		user: GoogleUser;
	}> {}

// Session type (if you plan to implement session management)
export interface Session {
	user: GoogleUser;
	accessToken: string;
	expiresAt: number;
}

// Common auth errors
export type AuthErrorCode =
	| "invalid_token"
	| "expired_token"
	| "invalid_grant"
	| "user_not_found"
	| "unauthorized";

export interface AuthError {
	code: AuthErrorCode;
	message: string;
}
