import type { IUserRepository } from "../interfaces/user.repository.interface";
import { DrizzleUserRepository } from "../repositories/user.repository";
import type { IUserRepositoryFactory } from "./user.repository.factory.interface";

export class DrizzleUserRepositoryFactory implements IUserRepositoryFactory {
	create(tx: any): IUserRepository {
		return new DrizzleUserRepository(tx);
	}
}
