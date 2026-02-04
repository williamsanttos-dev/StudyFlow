import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z
    .string()
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/),
})

export const registerUserSchema = z.object({
  name: z.string().trim().min(2),
  username: z.string().trim().min(2),
  email: z.email().trim(),
  password: z
    .string()
    .trim()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'password must contain uppercase letters, lowercase letters, numbers and at least 8 characters',
    ),
  age: z.number(),
})

export type LoginUserDTO = z.infer<typeof loginSchema>
export type CreateUserDTO = z.infer<typeof registerUserSchema>
