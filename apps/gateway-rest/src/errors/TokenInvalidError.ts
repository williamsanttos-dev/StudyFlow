import { AppError } from "./AppError";

export class TokenInvalidError extends AppError {
	constructor() {
		super("Invalid token", 401, "INVALID_TOKEN");
	}
}
