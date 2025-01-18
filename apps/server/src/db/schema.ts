import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
	id: varchar("id").primaryKey(), // Google ID
	email: varchar("email").notNull(),
	name: varchar("name").notNull(),
	picture: text("picture"),
	// locale: varchar("locale").default("en"), // For future use
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const codeSnippets = pgTable("code_snippets", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: varchar("user_id")
		.notNull()
		.references(() => users.id),
	language: varchar("language", { length: 10 }).notNull(), // python, cpp, java
	code: text("code").notNull(),
	output: text("output").notNull(),
	success: boolean("success").notNull(),
	fileUrl: text("file_url"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	snippets: many(codeSnippets),
}));

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
	user: one(users, {
		fields: [codeSnippets.userId],
		references: [users.id],
	}),
}));
