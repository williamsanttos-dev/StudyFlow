import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export class PaginationArgs {
	@Field(() => Int, { defaultValue: 10 })
	take: number;

	@Field(() => Int, { defaultValue: 0 })
	skip: number;
}
