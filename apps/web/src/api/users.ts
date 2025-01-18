import type { GoogleUser } from "~shared/types/auth";
import kyInstance from "./kyInstance";

export const createUser = async (userData: GoogleUser) => {
	try {
		return await kyInstance
			.post("users", {
				json: userData,
			})
			.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to create user: ${error.message}`);
		}
		throw new Error("An unknown error occurred while creating user");
	}
};
