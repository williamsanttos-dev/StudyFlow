export interface IRefreshTokenRepository {
	setRevokedByUserId(userId: string): Promise<void>;
	create(userId: string, tokenHash: string): Promise<void>;
}
