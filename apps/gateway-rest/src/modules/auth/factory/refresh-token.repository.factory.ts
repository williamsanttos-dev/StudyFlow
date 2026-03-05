import type { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";
import { DrizzleRefreshTokenRepository } from "../repositories/refresh-token.repository";
import type { IRefreshTokenRepositoryFactory } from "./refresh-token.repository.factory.interface";

export class DrizzleRefreshTokenRepositoryFactory
	implements IRefreshTokenRepositoryFactory
{
	create(tx: any): IRefreshTokenRepository {
		return new DrizzleRefreshTokenRepository(tx);
	}
}
