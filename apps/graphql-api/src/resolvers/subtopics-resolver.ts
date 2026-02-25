import { Query, Resolver, Mutation, Arg, Args } from "type-graphql";
import { and, eq } from "drizzle-orm";
import { GraphQLError } from "graphql";

// my package
import { db } from "db";
import { subtopics } from "@db/schema";

import { Subtopic } from "@/models/Subtopic";
import { SubtopicInput } from "@/models/dto/new-subtopic-input";
import { PaginationArgs } from "@/args/pagination-args";
import { SubtopicUpdateInput } from "@/models/dto/update-subtopic-input";

@Resolver(Subtopic)
export class SubtopicsResolver {
	@Mutation(() => Subtopic)
	async createSubtopic(
		@Arg("data", () => SubtopicInput) data: SubtopicInput,
		@Arg("topicId", () => String) topicId: string,
	) {
		const [subtopic] = await db
			.insert(subtopics)
			.values({
				title: data.title,
				topicId: topicId,
			})
			.returning();

		return subtopic;
	}

	@Query(() => Subtopic, { nullable: true })
	async subtopic(
		@Arg("id", () => String) id: string,
		@Arg("topicId", () => String) topicId: string,
	) {
		const [subtopic] = await db
			.select({
				id: subtopics.id,
				title: subtopics.title,
				topicId: subtopics.topicId,
				done: subtopics.done,
				createdAt: subtopics.createdAt,
				updatedAt: subtopics.updatedAt,
			})
			.from(subtopics)
			.where(and(eq(subtopics.id, id), eq(subtopics.topicId, topicId)));

		return subtopic;
	}

	@Query(() => [Subtopic], { nullable: true })
	async subtopics(
		@Args(() => PaginationArgs) { take, skip }: PaginationArgs,
		@Arg("topicId", () => String) topicId: string,
	) {
		const result = await db.query.subtopics.findMany({
			columns: {
				id: true,
				topicId: true,
				title: true,
				done: true,
				createdAt: true,
				updatedAt: true,
			},
			where: eq(subtopics.topicId, topicId),
			limit: take,
			offset: skip,
		});

		return result;
	}

	@Mutation(() => Subtopic, { nullable: true })
	async updateSubtopic(
		@Arg("data", () => SubtopicUpdateInput) data: SubtopicUpdateInput,
		@Arg("id", () => String) id: string,
		@Arg("topicId", () => String) topicId: string,
	) {
		if (data.done === undefined && data.title === undefined)
			throw new GraphQLError("At least one field must be provided", {
				extensions: {
					code: "BAD_USER_INPUT",
					fields: ["title", "done"],
				},
			});

		const [subtopic] = await db
			.update(subtopics)
			.set({
				title: data.title,
				done: data.done,
				updatedAt: new Date(),
			})
			.where(and(eq(subtopics.id, id), eq(subtopics.topicId, topicId)))
			.returning();

		return subtopic;
	}

	@Mutation(() => Boolean)
	async deleteSubtopic(
		@Arg("id", () => String) id: string,
		@Arg("topicId", () => String) topicId: string,
	) {
		await db
			.delete(subtopics)
			.where(and(eq(subtopics.id, id), eq(subtopics.topicId, topicId)));

		return true;
	}
}
