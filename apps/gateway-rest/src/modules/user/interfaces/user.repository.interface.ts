import type { User } from "../models/User";

export type InsertUserPayload = {
	name: string;
	username: string;
	email: string;
	birthDate: Date;
	passwordHash: string;
};

export interface IUserRepository {
	findByEmailOrUsernameExist(
		email: string,
		username: string,
	): Promise<User | null>;
	insertUser(data: InsertUserPayload): Promise<void>;
	findById(id: string): Promise<User | null>;
}
