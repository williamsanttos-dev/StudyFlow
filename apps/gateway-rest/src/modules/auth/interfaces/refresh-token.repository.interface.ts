export type TokenNotRevokedPayload = {
	tokenHash: string;
	expiresAt: Date;
	id: string;
};

export interface IRefreshTokenRepository {
	setRevokedByUserId(userId: string): Promise<void>;
	create(userId: string, tokenHash: string): Promise<string>;
	getTokenNotRevokedByUserId(
		userId: string,
	): Promise<TokenNotRevokedPayload | null>;
	setTokenRevokedById(newTokenId: string, oldTokenId: string): Promise<void>;
}
