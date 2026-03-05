import type { IUserRepository } from "../interfaces/user.repository.interface";

export interface IUserRepositoryFactory {
	create(tx: any): IUserRepository;
}
