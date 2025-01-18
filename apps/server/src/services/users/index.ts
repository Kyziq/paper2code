import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";
import { logger } from "~/utils/logger";
import type { GoogleUser } from "~shared/types/auth";

export async function findOrCreateUser(userData: GoogleUser) {
	try {
		// First try to find the user
		const existingUser = await db.query.users.findFirst({
			where: eq(users.id, userData.id),
		});

		if (existingUser) {
			logger.info(`Found existing user: ${userData.email}`);
			return existingUser;
		}

		// Create new user if not found
		const [newUser] = await db
			.insert(users)
			.values({
				id: userData.id,
				email: userData.email,
				name: userData.name,
				picture: userData.picture,
			})
			.returning();

		logger.success(`Created new user: ${userData.email}`);
		return newUser;
	} catch (error) {
		logger.error(`Error in findOrCreateUser: ${error}`);
		throw error;
	}
}
