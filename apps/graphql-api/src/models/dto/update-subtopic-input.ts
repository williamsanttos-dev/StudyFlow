import { IsBoolean, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class SubtopicUpdateInput {
	@Field(() => String, { nullable: true })
	@Length(1, 255)
	title?: string;

	@Field(() => Boolean, { nullable: true })
	@IsBoolean()
	done?: boolean;
}
