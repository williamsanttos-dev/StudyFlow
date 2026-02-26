import { AppError } from "./AppError";

export class NotFoundError extends AppError {
	constructor() {
		super("Not Found", 404, "NOT_FOUND");
	}
}
