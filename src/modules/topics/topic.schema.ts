import { z } from 'zod'

export const TopicRequestSchema = z.object({
  title: z.string().trim().min(1),
})

export type TopicRequestDTO = z.infer<typeof TopicRequestSchema>
