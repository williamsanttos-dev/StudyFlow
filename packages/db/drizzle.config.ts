import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./migration",
	schema: "./schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});