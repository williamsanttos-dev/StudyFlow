import { app } from "./app";

// my package
import { testNow } from "db";

async function bootstrap() {
	try {
		// check database
		const now = await testNow();
		console.log("DB NOW:", now);
	} catch (err) {
		console.error("❌ Database connection failed:", err);
		process.exit(1); // fast-fail
	}

	app.get("/health", (_request, reply) => {
		return reply.status(200).send({ status: "UP", db: "UP" });
	});

	await app.listen({ port: 3333, host: "0.0.0.0" });

	console.log("🚀 Server running");
	console.log("Health check available at http://localhost:3333/health");
	console.log("Docs available at http://localhost:3333/docs");
}
bootstrap();
