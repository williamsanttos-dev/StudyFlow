import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Subtopic {
	@Field((type) => ID)
	id: string;

	@Field((type) => ID)
	topicId: string;

	@Field(() => Boolean)
	done: boolean;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
