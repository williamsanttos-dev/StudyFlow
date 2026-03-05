import { FastifyReply, FastifyRequest } from "fastify";
import { IUserService } from "../interfaces/user.service.interface";
import { UnauthorizedError } from "@/errors/UnauthorizedError";

export class FetchUser {
	constructor(private readonly userService: IUserService) {}

	handler = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user?.userId;
		if (!userId) throw new UnauthorizedError("unauthorized");

		const user = await this.userService.fetchUser(userId);

		return reply.status(200).send({ data: user });
	};
}
