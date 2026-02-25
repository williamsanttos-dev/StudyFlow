import { ObjectType, Field, ID } from "type-graphql";

import { Subtopic } from "./Subtopic.js";

@ObjectType()
export class Topic {
	@Field((type) => ID)
	id: string;

	@Field(() => String)
	title: string;

	@Field((type) => ID)
	authorId: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Number)
	progress: number;

	@Field((type) => [Subtopic])
	subtopics: Subtopic[];
}
