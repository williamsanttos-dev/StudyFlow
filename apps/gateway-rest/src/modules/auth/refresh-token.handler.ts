import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { eq, and, isNull } from "drizzle-orm";

import { db } from "@/db";
import { refreshTokens } from "@/db/schemas/refresh";
import { app } from "@/app";

const X_CLIENT_TYPE = {
	web: "web",
	mobile: "mobile",
};

export async function refreshTokenHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const refreshToken =
		request.cookies.refresh_token ??
		request.headers.authorization?.split(" ")[1];

	if (!refreshToken) throw app.httpErrors.unauthorized("TOKEN_NOT_FOUND");

	try {
		const userId = String(
			jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN),
		);

		await db.transaction(async (tx) => {
			const refreshTokenHashAndExpiresAtAndUuid = await tx
				.select({
					tokenHash: refreshTokens.tokenHash,
					expiresAt: refreshTokens.expiresAt,
					id: refreshTokens.id,
				})
				.from(refreshTokens)
				.where(
					and(
						eq(refreshTokens.userId, userId),
						isNull(refreshTokens.revokedAt),
					),
				);
			if (refreshTokenHashAndExpiresAtAndUuid.length === 0)
				throw app.httpErrors.unauthorized("TOKEN_REVOKED_OR_NOT_FOUND");

			// verify if the refresh from database is expired
			if (
				refreshTokenHashAndExpiresAtAndUuid[0].expiresAt < new Date(Date.now())
			)
				throw app.httpErrors.unauthorized("TOKEN_EXPIRED");

			// verify if the refresh from database is equal the refresh send by client
			const refreshTokenMatch = await bcrypt.compare(
				refreshToken,
				refreshTokenHashAndExpiresAtAndUuid[0].tokenHash,
			);
			if (!refreshTokenMatch)
				throw app.httpErrors.unauthorized("INVALID_TOKEN");

			// Create new tokens
			const newRefreshToken = jwt.sign(
				{ userId: userId },
				process.env.SECRET_REFRESH_TOKEN,
				{ expiresIn: "7d" },
			);
			const newAccessToken = jwt.sign(
				{ userId: userId },
				process.env.SECRET_ACCESS_TOKEN,
				{ expiresIn: "12h" },
			);

			const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
			// insert the new refresh hashed in database
			const refresh = await db
				.insert(refreshTokens)
				.values({
					userId: userId,
					tokenHash: newRefreshHash,
					expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
				})
				.returning({ uuid: refreshTokens.id });

			// invalid the old refresh
			await db
				.update(refreshTokens)
				.set({
					revokedAt: new Date(Date.now()),
					replacedByToken: refresh[0].uuid,
				})
				.where(eq(refreshTokens.id, refreshTokenHashAndExpiresAtAndUuid[0].id));

			// verify the "type" of the client
			if (request.headers["x-client-type"] === X_CLIENT_TYPE.mobile)
				return reply
					.status(200)
					.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });

			// if the client is "web", is sended cookies
			return reply
				.setCookie("access_token", newAccessToken, {
					httpOnly: true,
					secure: false, // true in production
					sameSite: "lax",
					path: "/",
					maxAge: 60 * 60,
				})
				.setCookie("refresh_token", newRefreshToken, {
					httpOnly: true,
					secure: false, // true in production
					sameSite: "lax",
					path: "/",
					maxAge: 60 * 60 * 24 * 7,
				})
				.status(200)
				.send({ message: "ok" });
		});
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			console.error("JsonWebToken err:", err);
			throw app.httpErrors.unauthorized("INVALID_TOKEN");
		}
		console.error("INTERNAL_SERVER_ERROR:", err);
		throw app.httpErrors.internalServerError("INTERNAL_SERVER_ERROR");
	}
}
