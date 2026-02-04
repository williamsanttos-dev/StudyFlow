import { z } from 'zod'

export const SubtopicRequestSchema = z.object({
  title: z.string().trim().min(1),
})

export type SubtopicRequestDTO = z.infer<typeof SubtopicRequestSchema>
