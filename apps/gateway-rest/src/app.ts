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

import { db } from "db";

import { authPlugin } from "./plugins/auth";
import { registerUserHandler } from "./modules/auth/register-user.handler";
import { fetchUserHandler } from "./modules/auth/fetch-user.handler";
import { graphql } from "./clients/graphql";
import { AppError } from "./errors/AppError";
import { DrizzleTransactionManager } from "./modules/auth/transaction/transaction-manager";
import { AuthService } from "./modules/auth/services/auth.service";
import { DrizzleRefreshTokenRepository } from "./modules/auth/repositories/refresh-token.repository";
import { BcryptHashProvider } from "./shared/providers/hash.provider";
import { JwtTokenProvider } from "./modules/auth/providers/token.provider";
import { LoginController } from "./modules/auth/controllers/login.controller";
import { DrizzleUserRepositoryFactory } from "./modules/auth/factory/user.repository.factory";
import { DrizzleRefreshTokenRepositoryFactory } from "./modules/auth/factory/refresh-token.repository.factory";
import { RefreshController } from "./modules/auth/controllers/refresh.controller";
import { LogoutController } from "./modules/auth/controllers/logout.controller";
import { RegisterController } from "./modules/user/controllers/register.controller";
import { UserService } from "./modules/user/services/user.service";
import { DrizzleUserRepository } from "./modules/user/repositories/user.repository";

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

app.setErrorHandler((error, _request, reply) => {
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			code: error.code,
			message: error.message,
		});
	}
	// analisar
	console.error(error);

	return reply.status(500).send({
		code: "INTERNAL_SERVER_ERROR",
		message: "Internal server error",
	});
});

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

app.register(ScalarApiReference, {
	routePrefix: "/docs",
});

// Infra
const transactionManager = new DrizzleTransactionManager(db);

// Repository
const userRepositoryFactory = new DrizzleUserRepositoryFactory();
const refreshRepositoryFactory = new DrizzleRefreshTokenRepositoryFactory();
const refreshRepository = new DrizzleRefreshTokenRepository(db);
const userRepository = new DrizzleUserRepository(db);

// Service
const authService = new AuthService(
	userRepositoryFactory,
	refreshRepositoryFactory,
	refreshRepository,
	new BcryptHashProvider(),
	new JwtTokenProvider(),
	transactionManager,
);
const userService = new UserService(userRepository, new BcryptHashProvider());

// Controller
const loginController = new LoginController(authService);
const refreshController = new RefreshController(authService);
const logoutController = new LogoutController(authService);
const registerController = new RegisterController(userService);

// // PUBLIC ROUTES
app.post("/v1/auth/login", loginController.handler);
app.post("/v1/auth/refresh", refreshController.handler);
app.post("/v1/user/register", registerController.handler);

// PRIVATE ROUTES
app.register(async (fastify: FastifyInstance) => {
	fastify.register(authPlugin);

	fastify.post("/v1/auth/logout", logoutController.handler);
	fastify.get("/v1/auth/me", fetchUserHandler);
	fastify.post("/v1/graphql", graphql);
});
