import "node:http";

declare module "http" {
	interface IncomingMessage {
		user: {
			userId: string;
		};
	}
}
