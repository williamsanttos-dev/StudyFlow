import "reflect-metadata";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import { GraphQLError } from "graphql";

// my packages
import { testNow } from "db";

import { TopicsResolver } from "./resolvers/topics-resolver";
import { SubtopicsResolver } from "./resolvers/subtopics-resolver";

interface MyContext {
	userId: string | string[] | undefined;
}

async function bootstrap() {
	try {
		// check database
		const now = await testNow();
		console.log("DB NOW:", now);
	} catch (err) {
		console.error("❌ Database connection failed:", err);
		process.exit(1); // fast-fail
	}

	const schema = await buildSchema({
		resolvers: [TopicsResolver, SubtopicsResolver],
		emitSchemaFile: path.resolve(
			path.dirname(fileURLToPath(import.meta.url)),
			"schema.gql",
		),
		validate: true,
	});

	const server = new ApolloServer<MyContext>({
		schema,
		introspection: true,
		includeStacktraceInErrorResponses: true,
	});

	const { url } = await startStandaloneServer(server, {
		listen: { port: 4000 },
		context: async ({ req }) => {
			let userId = req.headers["x-user-id"];

			if (!userId || typeof userId !== "string") {
				if (process.env.NODE_ENV === "production")
					throw new GraphQLError("Authentication required.", {
						extensions: {
							code: "UNAUTHENTICATED",
						},
					});
				// for test, create a user and put the id here
				userId = "adb85749-ab68-4d76-86f7-98f0deaf44cf";
			}
			return { userId };
		},
	});

	console.log(`🚀 Server ready at: ${url}`);
}
bootstrap();
