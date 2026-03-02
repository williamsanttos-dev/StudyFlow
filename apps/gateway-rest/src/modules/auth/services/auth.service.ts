import type { IAuthService } from "../interfaces/auth.service.interface";
import type { BcryptHashProvider } from "@/shared/providers/hash.provider";
import type { JwtTokenProvider } from "../providers/token.provider";
import type { DrizzleTransactionManager } from "../transaction/transaction-manager";
import { InvalidCredentialsError } from "@/errors/InvalidCredentialsError";
import { TokenInvalidError } from "@/errors/TokenInvalidError";
import type { IUserRepositoryFactory } from "../factory/user.repository.factory.interface";
import type { IRefreshTokenRepositoryFactory } from "../factory/refresh-token.repository.factory.interface";
import { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";

type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

type JwtVerifyPayload = {
	userId: string;
	iat: number;
	exp: number;
};

export class AuthService implements IAuthService {
	constructor(
		private userRepositoryFactory: IUserRepositoryFactory,
		private refreshRepositoryFactory: IRefreshTokenRepositoryFactory,
		private refreshRepository: IRefreshTokenRepository,
		private hashProvider: BcryptHashProvider,
		private tokenProvider: JwtTokenProvider,
		private transactionManager: DrizzleTransactionManager,
	) {}

	async login(email: string, password: string): Promise<AuthTokens> {
		return this.transactionManager.runInTransaction(async (tx) => {
			const userRepo = this.userRepositoryFactory.create(tx);
			const refreshRepo = this.refreshRepositoryFactory.create(tx);

			const user = await userRepo.findAuthUserByEmail(email);

			if (!user || !this.hashProvider.compare(password, user.passwordHash))
				throw InvalidCredentialsError;

			const [accessToken, refreshToken] = [
				this.tokenProvider.sign({ userId: user.userId }, "access"),
				this.tokenProvider.sign({ userId: user.userId }, "refresh"),
			];

			const refreshTokenHash = await this.hashProvider.hash(refreshToken);

			await refreshRepo.setRevokedByUserId(user.userId);
			await refreshRepo.create(user.userId, refreshTokenHash);

			return { accessToken, refreshToken };
		});
	}
	async refresh(refreshToken: string): Promise<AuthTokens> {
		return this.transactionManager.runInTransaction(async (tx) => {
			const refreshRepo = this.refreshRepositoryFactory.create(tx);

			const payload: JwtVerifyPayload = this.tokenProvider.verify(
				refreshToken,
				"refresh",
			);

			const actualRefresh = await refreshRepo.getTokenNotRevokedByUserId(
				payload.userId,
			);

			if (
				!actualRefresh ||
				actualRefresh.expiresAt < new Date() ||
				!(await this.hashProvider.compare(
					refreshToken,
					actualRefresh.tokenHash,
				))
			)
				throw new TokenInvalidError();

			const [newAccessToken, newRefreshToken] = [
				this.tokenProvider.sign({ userId: payload.userId }, "access"),
				this.tokenProvider.sign({ userId: payload.userId }, "refresh"),
			];

			const refreshHash = await this.hashProvider.hash(newRefreshToken);

			const newRefreshId = await refreshRepo.create(
				payload.userId,
				refreshHash,
			);

			await refreshRepo.setTokenRevokedById(newRefreshId, actualRefresh.id);

			return { accessToken: newAccessToken, refreshToken: newRefreshToken };
		});
	}
	async logout(userId: string): Promise<void> {
		return await this.refreshRepository.setRevokedByUserId(userId);
	}
}
