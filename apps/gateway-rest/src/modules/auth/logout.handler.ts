import type { FastifyRequest, FastifyReply } from "fastify";
import { isNull, and, eq } from "drizzle-orm";

import { db } from "@/db";
import { refreshTokens } from "@/db/schemas/refresh";
import { app } from "@/app";

export async function logoutHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const userId = request.user?.userId;
	if (!userId) return app.httpErrors.unauthorized("INSUFFICIENT_DATA");

	await db
		.update(refreshTokens)
		.set({ revokedAt: new Date(Date.now()) })
		.where(
			and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
		);

	// replace cookies values
	return reply
		.status(200)
		.setCookie("access_token", "null", {
			httpOnly: true,
			secure: false, // true in production
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		})
		.setCookie("refresh_token", "null", {
			httpOnly: true,
			secure: false, // true in production
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		})
		.send({ message: "ok" });
}
