import type { DrizzleDatabase } from "@/types/DrizzleDatabase";
import { IUserRepository } from "../interfaces/user.repository.interface";

import { usersTable as users } from "db/schema";
import { eq } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
	constructor(private readonly db: DrizzleDatabase) {}

	async findAuthUserByEmail(
		email: string,
	): Promise<{ passwordHash: string; userId: string } | null> {
		const result = await this.db
			.select({ passwordHash: users.passwordHash, userId: users.id })
			.from(users)
			.where(eq(users.email, email));

		if (result.length === 0) return null;
		return result[0];
	}
}
