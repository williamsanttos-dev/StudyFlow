import { fastify, FastifyInstance } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	jsonSchemaTransform,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";
import sensible from "@fastify/sensible";
import cookie from "@fastify/cookie";

import { authPlugin } from "./plugins/auth";
import { registerUserHandler } from "./modules/auth/register-user.handler";
import { loginHandler } from "./modules/auth/login.handler";
import { refreshTokenHandler } from "./modules/auth/refresh-token.handler";
import { logoutHandler } from "./modules/auth/logout.handler";
import { fetchUserHandler } from "./modules/auth/fetch-user.handler";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(sensible);

app.register(fastifyCors, {
	origin: true, // don't have interaction with browser for now
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	credentials: true,
	// credentials or JWT sessions?
});

app.register(cookie, { secret: process.env.COOKIE_SECRET });

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "Study Flow API",
			description: "API for monitor progress in studies",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

// PUBLIC ROUTES
app.post("/v1/auth/register", registerUserHandler);
app.post("/v1/auth/login", loginHandler);
app.post("/v1/auth/refresh", refreshTokenHandler);

app.register(ScalarApiReference, {
	routePrefix: "/docs",
});

// PRIVATE ROUTES
app.register(async (fastify: FastifyInstance) => {
	fastify.register(authPlugin);

	fastify.post("/v1/auth/logout", logoutHandler);
	fastify.get("/v1/auth/me", fetchUserHandler);

	// fastify.post("/v1/graphql")
});
