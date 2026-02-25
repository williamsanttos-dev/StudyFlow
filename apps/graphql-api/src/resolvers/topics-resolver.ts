import {
	Query,
	Resolver,
	Mutation,
	Arg,
	Ctx,
	FieldResolver,
	Root,
	Args,
} from "type-graphql";
import { and, eq } from "drizzle-orm";

// my packages
import { db } from "db";
import { topics, subtopics } from "db/schema";

import { Topic } from "@/models/Topic";
import { TopicInput } from "@/models/dto/new-topic-input";
import { PaginationArgs } from "@/args/pagination-args";

@Resolver(Topic)
export class TopicsResolver {
	@Query(() => String)
	async helloWorld() {
		return "Hello world";
	}

	@Mutation(() => Topic)
	async createTopic(
		@Arg("data", () => TopicInput) data: TopicInput,
		@Ctx("userId") userId: string,
	) {
		const [topic] = await db
			.insert(topics)
			.values({
				title: data.title,
				authorId: userId,
			})
			.returning();

		return topic;
	}

	@Query(() => Topic, { nullable: true })
	async topic(
		@Arg("id", () => String) id: string,
		@Ctx("userId") userId: string,
	) {
		const [topic] = await db
			.select({
				id: topics.id,
				title: topics.title,
				authorId: topics.authorId,
				createdAt: topics.createdAt,
				updatedAt: topics.updatedAt,
			})
			.from(topics)
			.where(and(eq(topics.id, id), eq(topics.authorId, userId)));

		return topic;
	}

	@Query(() => [Topic], { nullable: true })
	async topics(
		@Args(() => PaginationArgs) { take, skip }: PaginationArgs,
		@Ctx("userId") userId: string,
	) {
		const result = await db.query.topics.findMany({
			columns: {
				id: true,
				authorId: true,
				title: true,
				createdAt: true,
				updatedAt: true,
			},
			where: eq(topics.authorId, userId),
			limit: take,
			offset: skip,
		});

		return result;
	}

	@Mutation(() => Topic, { nullable: true })
	async updateTopic(
		@Arg("data", () => TopicInput) data: TopicInput,
		@Arg("id", () => String) id: string,
		@Ctx("userId") userId: string,
	) {
		const [topic] = await db
			.update(topics)
			.set({
				title: data.title,
				updatedAt: new Date(),
			})
			.where(and(eq(topics.authorId, userId), eq(topics.id, id)))
			.returning();

		return topic;
	}

	@Mutation(() => Boolean)
	async deleteTopic(
		@Arg("id", () => String) id: string,
		@Ctx("userId") userId: string,
	) {
		await db
			.delete(topics)
			.where(and(eq(topics.id, id), eq(topics.authorId, userId)));

		return true;
	}

	@FieldResolver()
	async subtopics(
		@Root() topic: Topic,
		@Args(() => PaginationArgs) { take, skip }: PaginationArgs,
	) {
		return db.query.subtopics.findMany({
			where: eq(subtopics.topicId, topic.id),
			limit: take,
			offset: skip,
		});
	}
	@FieldResolver()
	async progress(@Root() topic: Topic) {
		const subs = await db.query.subtopics.findMany({
			where: eq(subtopics.topicId, topic.id),
		});

		if (subs.length === 0) return 0;

		const completed = subs.filter((s) => s.done).length;
		return completed / subs.length;
	}
}
