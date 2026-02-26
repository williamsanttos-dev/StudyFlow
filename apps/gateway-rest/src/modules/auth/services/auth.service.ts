import type { IAuthService } from "../interfaces/auth.service.interface";
import type { BcryptHashProvider } from "../providers/hash.provider";
import type { JwtTokenProvider } from "../providers/token.provider";
import type { DrizzleTransactionManager } from "../transaction/transaction-manager";
import { InvalidCredentialsError } from "@/errors/InvalidCredentialsError";
import type { DrizzleUserRepositoryFactory } from "../factory/user.repository.factory";
import type { DrizzleRefreshTokenRepositoryFactory } from "../factory/refresh-token.repository.factory";

export class AuthService implements IAuthService {
	constructor(
		private userRepositoryFactory: DrizzleUserRepositoryFactory,
		private refreshRepositoryFactory: DrizzleRefreshTokenRepositoryFactory,
		private hashProvider: BcryptHashProvider,
		private tokenProvider: JwtTokenProvider,
		private transactionManager: DrizzleTransactionManager,
	) {}

	async login(
		email: string,
		password: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
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
}
