import {
	date,
	pgTable,
	varchar,
	text,
	uuid,
	timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),

	passwordHash: text("password_hash").notNull(),

	birthDate: date("birth_date", { mode: "date" }).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
