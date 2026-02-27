import type { DrizzleDatabase } from "@/types/DrizzleDatabase";
import {
	IRefreshTokenRepository,
	TokenNotRevokedPayload,
} from "../interfaces/refresh-token.repository.interface";

import { refreshTokens } from "db/schema";
import { and, eq, isNull } from "drizzle-orm";

export class DrizzleRefreshTokenRepository implements IRefreshTokenRepository {
	constructor(private readonly db: DrizzleDatabase) {}

	async create(userId: string, tokenHash: string): Promise<string> {
		// this value is the same 'expiresIn' in token.provider
		const expireTime = 60 * 60 * 24 * 7 * 1000; // 7 days

		const [result] = await this.db
			.insert(refreshTokens)
			.values({
				userId: userId,
				tokenHash: tokenHash,
				expiresAt: new Date(Date.now() + expireTime),
			})
			.returning({ id: refreshTokens.id });

		return result.id;
	}
	async setRevokedByUserId(userId: string): Promise<void> {
		await this.db
			.update(refreshTokens)
			.set({
				revokedAt: new Date(Date.now()),
			})
			.where(eq(refreshTokens.userId, userId));
	}
	async getTokenNotRevokedByUserId(
		userId: string,
	): Promise<TokenNotRevokedPayload | null> {
		const result = await this.db
			.select({
				tokenHash: refreshTokens.tokenHash,
				expiresAt: refreshTokens.expiresAt,
				id: refreshTokens.id,
			})
			.from(refreshTokens)
			.where(
				and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
			)
			.limit(1);

		return result[0] ?? null;
	}
	async setTokenRevokedById(
		newTokenId: string,
		oldTokenId: string,
	): Promise<void> {
		await this.db
			.update(refreshTokens)
			.set({
				revokedAt: new Date(Date.now()),
				replacedByToken: newTokenId,
			})
			.where(eq(refreshTokens.id, oldTokenId));
	}
}
