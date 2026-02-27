import { FastifyReply, FastifyRequest } from "fastify";
import type { AuthService } from "../services/auth.service";
import { UnauthorizedError } from "@/errors/UnauthorizedError";

export class LogoutController {
	constructor(private authService: AuthService) {}

	handler = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = request.user?.userId;
		if (!userId) throw new UnauthorizedError("unauthorized");

		await this.authService.logout(userId);

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
	};
}
