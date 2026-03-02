import type { FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";

// my package
import { db } from "db";
import { usersTable as users } from "db/schema";

import { app } from "@/app";
import { UserResponseDTO } from "../user/models/dto/user.response";

export async function fetchUserHandler(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<UserResponseDTO> {
	const userId = request.user?.userId;
	if (!userId) throw app.httpErrors.unauthorized("INSUFFICIENT_DATA");

	const user = await db
		.select({
			name: users.name,
			username: users.username,
			email: users.email,
			birthDate: users.birthDate,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
		})
		.from(users)
		.where(eq(users.id, userId));

	if (user.length === 0) throw app.httpErrors.notFound("NOT_FOUND");

	const age = new Date().getFullYear() - user[0].birthDate.getFullYear();

	return reply.status(200).send({
		name: user[0].name,
		username: user[0].username,
		email: user[0].email,
		age: age,
		createdAt: user[0].createdAt.toISOString(),
		updatedAt: user[0].updatedAt.toISOString(),
	});
}
