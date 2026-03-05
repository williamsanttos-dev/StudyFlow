import type { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";

export interface IRefreshTokenRepositoryFactory {
	create(tx: any): IRefreshTokenRepository;
}
