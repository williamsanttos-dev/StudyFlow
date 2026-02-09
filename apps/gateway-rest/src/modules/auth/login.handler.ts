import type { FastifyRequest, FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { app } from "@/app";
import { db } from "@/db";
import { usersTable as users } from "@/db/schemas/users";
import { refreshTokens } from "@/db/schemas/refresh";
import { loginSchema } from "./auth.schemas";

const X_CLIENT_TYPE = {
	web: "web",
	mobile: "mobile",
};

export async function loginHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// pre validation of password
	const data = loginSchema.safeParse(request.body);
	if (!data.success) throw app.httpErrors.badRequest("INVALID_CREDENTIALS");

	await db.transaction(async (tx) => {
		const passwordHashAndUserId = await tx
			.select({ passwordHash: users.passwordHash, userId: users.id })
			.from(users)
			.where(eq(users.email, data.data.email));

		if (passwordHashAndUserId.length === 0)
			throw app.httpErrors.notFound("INVALID_CREDENTIALS");

		if (
			!(await bcrypt.compare(
				data.data.password,
				passwordHashAndUserId[0].passwordHash,
			))
		)
			throw app.httpErrors.badRequest("INVALID_CREDENTIALS");

		const accessToken = jwt.sign(
			{
				userId: passwordHashAndUserId[0].userId,
			},
			process.env.SECRET_ACCESS_TOKEN,
			{ expiresIn: "1h" },
		);
		const refreshToken = jwt.sign(
			{
				userId: passwordHashAndUserId[0].userId,
			},
			process.env.SECRET_REFRESH_TOKEN,
			{ expiresIn: "7d" },
		);

		const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

		// revokes all old tokens in the database belonging to the user
		await tx
			.update(refreshTokens)
			.set({
				revokedAt: new Date(Date.now()),
			})
			.where(eq(refreshTokens.userId, passwordHashAndUserId[0].userId));

		// add new refresh token in database
		await tx.insert(refreshTokens).values({
			userId: passwordHashAndUserId[0].userId,
			tokenHash: refreshTokenHash,
			expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
		});

		if (request.headers["x-client-type"] === X_CLIENT_TYPE.mobile)
			return reply
				.status(200)
				.send({ accessToken: accessToken, refreshToken: refreshToken });

		return reply
			.setCookie("access_token", accessToken, {
				httpOnly: true,
				secure: false, // true in production
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60,
			})
			.setCookie("refresh_token", refreshToken, {
				httpOnly: true,
				secure: false, // true in production
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			})
			.status(200)
			.send({ message: "ok" });
	});
}
