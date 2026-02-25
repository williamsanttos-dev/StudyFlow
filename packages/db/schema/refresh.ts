import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable as users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid().defaultRandom().primaryKey(),

	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	tokenHash: text("token_hash").notNull().unique(),

	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

	revokedAt: timestamp("revoked_at", { withTimezone: true }),

	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),

	replacedByToken: uuid("replaced_by_token"),
});
