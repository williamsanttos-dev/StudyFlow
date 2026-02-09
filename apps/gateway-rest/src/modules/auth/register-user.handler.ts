import type { FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import { registerUserSchema } from "./auth.schemas";
import { app } from "@/app";
import { db } from "@/db";
import { usersTable as users } from "@/db/schemas/users";

export async function registerUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const data = registerUserSchema.safeParse(request.body);
	if (!data.success)
		throw app.httpErrors.badRequest(data.error.issues[0].message);

	await db.transaction(async (tx) => {
		if (
			(
				await tx
					.select({ email: users.email })
					.from(users)
					.where(eq(users.email, data.data.email))
			).length > 0
		)
			throw app.httpErrors.conflict("EMAIL_ALREADY_EXISTS");
		if (
			(
				await tx
					.select({ username: users.username })
					.from(users)
					.where(eq(users.username, data.data.username))
			).length > 0
		)
			throw app.httpErrors.conflict("USERNAME_ALREADY_EXISTS");

		const passwordHash = await bcrypt.hash(data.data.password, 10);

		await tx.insert(users).values({
			name: data.data.name,
			username: data.data.username,
			email: data.data.email,
			birthDate: data.data.birthDate,
			passwordHash: passwordHash,
		});
	});

	return reply.status(200).send({ message: "ok" });
}
