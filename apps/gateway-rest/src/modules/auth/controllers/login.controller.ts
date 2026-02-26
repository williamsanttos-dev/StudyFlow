import type { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema } from "../auth.schemas";
import type { AuthService } from "../services/auth.service";

const X_CLIENT_TYPE = {
	web: "web",
	mobile: "mobile",
};

export class LoginController {
	constructor(private authService: AuthService) {}

	handler = async (request: FastifyRequest, reply: FastifyReply) => {
		const parsed = loginSchema.safeParse(request.body);

		if (!parsed.success)
			return reply.status(400).send({ message: "INVALID_CREDENTIALS" });

		const { email, password } = parsed.data;

		const result = await this.authService.login(email, password);

		const { accessToken, refreshToken } = result;

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
	};
}
