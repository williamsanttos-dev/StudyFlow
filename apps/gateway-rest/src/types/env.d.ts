declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test";
		DATABASE_URL: string;
		SECRET_ACCESS_TOKEN: string;
		SECRET_REFRESH_TOKEN: string;
		COOKIE_SECRET: string;
	}
}
