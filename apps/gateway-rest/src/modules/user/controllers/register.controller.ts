import type { FastifyRequest, FastifyReply } from "fastify";
import type { IUserService } from "../interfaces/user.service.interface";
import { registerUserSchema } from "../models/user.schema";
import { BadRequestError } from "@/errors/BadRequestError";

export class RegisterController {
	constructor(private readonly userService: IUserService) {}

	handler = async (request: FastifyRequest, reply: FastifyReply) => {
		const result = registerUserSchema.safeParse(request.body);
		if (!result.success)
			throw new BadRequestError(result.error.issues[0].message);

		await this.userService.register(result.data);

		reply.status(200).send({ message: "OK" });
	};
}
