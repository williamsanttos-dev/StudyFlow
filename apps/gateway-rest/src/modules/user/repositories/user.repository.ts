import { eq, or } from "drizzle-orm";

import { usersTable as users } from "db/schema";

import { DrizzleDatabase } from "@/types/DrizzleDatabase";
import type {
	InsertUserPayload,
	IUserRepository,
} from "../interfaces/user.repository.interface";
import type { User } from "../models/User";
import { ConflictError } from "@/errors/ConflictError";

export class DrizzleUserRepository implements IUserRepository {
	constructor(private readonly db: DrizzleDatabase) {}

	async findByEmailOrUsernameExist(
		email: string,
		username: string,
	): Promise<User | null> {
		const result = await this.db.query.usersTable.findFirst({
			where: or(eq(users.email, email), eq(users.username, username)),
		});

		if (!result) return null;
		return {
			id: result.id,
			email: result.email,
			name: result.name,
			username: result.username,
			birthDate: result.birthDate,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	}

	async insertUser(data: InsertUserPayload): Promise<void> {
		try {
			await this.db.insert(users).values(data).returning({ id: users.id });
		} catch (err: any) {
			if (err?.code === "23505")
				throw new ConflictError("Email or username already in use");
		}
	}
}
