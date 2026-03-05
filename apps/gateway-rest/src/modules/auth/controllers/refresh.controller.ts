import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/auth.service";
import { TokenInvalidError } from "@/errors/TokenInvalidError";
import { X_CLIENT_TYPE } from "@/types/const/x-client-type";

export class RefreshController {
	constructor(private authService: AuthService) {}

	handler = async (request: FastifyRequest, reply: FastifyReply) => {
		const refreshTokenReq =
			request.cookies.refresh_token ??
			request.headers.authorization?.split(" ")[1];

		if (!refreshTokenReq) throw new TokenInvalidError();

		const { accessToken, refreshToken } =
			await this.authService.refresh(refreshTokenReq);

		// verify the "type" of the client
		if (request.headers["x-client-type"] === X_CLIENT_TYPE.mobile)
			return reply.status(200).send({ accessToken, refreshToken });

		// if the client is "web", is sended cookies
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
