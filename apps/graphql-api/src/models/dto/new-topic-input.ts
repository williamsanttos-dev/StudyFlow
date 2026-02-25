import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class TopicInput {
	@Field(() => String)
	@Length(1, 255)
	title: string;
}
