import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"

import { usersTable as users } from "./users";
import { subtopics } from "./subtopics";

export const topics = pgTable("topics", {
	id: uuid("id").defaultRandom().primaryKey(),
	authorId: uuid("author_id").notNull().references(() => users.id),

	title: varchar("title", { length: 255 }).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),

});

// relations

// Topic -> many subtopics
export const topicsAndSubtopicsRelations = relations(topics, ({ many }) => ({
    subtopics: many(subtopics),
}))

// Topic -> one user
export const topicsRelations = relations(topics, ({ one }) => ({
	author: one(users, {
		fields: [topics.authorId],
		references: [users.id]
	})
}))

