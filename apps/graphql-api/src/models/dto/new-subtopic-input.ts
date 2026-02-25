import { MaxLength, Min } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class SubtopicInput {
	@Field(() => String)
	@Min(1)
	@MaxLength(255)
	title: string;
}
