import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { topics } from "./topics";

export const subtopics = pgTable("subtopics", {
    id: uuid().defaultRandom().primaryKey(),
    topicId: uuid("topic_id").notNull().references(() => topics.id),

    title: varchar({ length: 255 }).notNull(),
    done: boolean().default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


// Subtopic -> one topic
export const subtopicsRelations = relations(subtopics, ({ one }) => ({
    topic: one(topics, {
        fields: [subtopics.topicId],
        references: [topics.id]
    })
}))