import { z } from "zod";

export const loginSchema = z.object({
	email: z.email().trim(),
	password: z
		.string()
		.trim()
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
});

export type LoginUserDTO = z.infer<typeof loginSchema>;
