import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyInstance } from "fastify";
import * as jwt from "jsonwebtoken";

interface AuthPayload extends jwt.JwtPayload {
	userId: string;
}

export const authPlugin: FastifyPluginAsync = fp(
	async (fastify: FastifyInstance) => {
		fastify.decorateRequest("user", null);

		fastify.addHook("preValidation", async (request) => {
			const accessToken =
				request.cookies.access_token ??
				request.headers.authorization?.split(" ")[1];

			if (!accessToken)
				throw fastify.httpErrors.unauthorized("TOKEN_NOT_FOUND");

			try {
				const payload = jwt.verify(
					accessToken,
					process.env.SECRET_ACCESS_TOKEN,
				) as AuthPayload;

				request.user = {
					userId: payload.userId,
				};
			} catch (err) {
				if (err instanceof jwt.JsonWebTokenError) {
					console.error("JsonWebToken err:", err);
					throw fastify.httpErrors.unauthorized("INVALID_TOKEN");
				}
				console.error("INTERNAL_SERVER_ERROR:", err);
				throw fastify.httpErrors.internalServerError("INTERNAL_SERVER_ERROR");
			}
		});
	},
);
