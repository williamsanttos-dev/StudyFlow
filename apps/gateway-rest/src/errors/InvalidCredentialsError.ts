import { AppError } from "./AppError";

export class InvalidCredentialsError extends AppError {
	constructor() {
		super("Invalid credentials", 401, "INVALID_CREDENTIALS");
	}
}
