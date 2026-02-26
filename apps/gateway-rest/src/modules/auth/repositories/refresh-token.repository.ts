import type { DrizzleDatabase } from "@/types/DrizzleDatabase";
import { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";

import { refreshTokens } from "db/schema";
import { eq } from "drizzle-orm";

export class DrizzleRefreshTokenRepository implements IRefreshTokenRepository {
	constructor(private readonly db: DrizzleDatabase) {}

	async create(userId: string, tokenHash: string): Promise<void> {
		// this value is the same 'expiresIn' in token.provider
		const expireTime = 60 * 60 * 24 * 7 * 1000; // 7 days

		await this.db.insert(refreshTokens).values({
			userId: userId,
			tokenHash: tokenHash,
			expiresAt: new Date(Date.now() + expireTime),
		});
	}
	async setRevokedByUserId(userId: string): Promise<void> {
		await this.db
			.update(refreshTokens)
			.set({
				revokedAt: new Date(Date.now()),
			})
			.where(eq(refreshTokens.userId, userId));
	}
}
