import { z } from "zod";

export const loginSchema = z.object({
	email: z.email().trim(),
	password: z
		.string()
		.trim()
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

export const registerUserSchema = z.object({
	name: z.string().trim().min(2),
	username: z.string().trim().min(2),
	email: z.email().trim(),
	password: z
		.string()
		.trim()
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
			"password must contain uppercase letters, lowercase letters, numbers and at least 8 characters",
		),
	birthDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid format. Use YYYY-MM-DD")
		.transform((val) => new Date(val)),
});

export type LoginUserDTO = z.infer<typeof loginSchema>;
export type CreateUserDTO = z.infer<typeof registerUserSchema>;
