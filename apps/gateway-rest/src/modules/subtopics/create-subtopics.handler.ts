import type { FastifyRequest, FastifyReply } from 'fastify'
import { SubtopicRequestSchema } from './sub-topics.schema'
import { app } from '@/app'

export async function createSubTopicHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = SubtopicRequestSchema.safeParse(request.body)
  if (!data.success) throw app.httpErrors.badRequest('Invalid payload')

  return reply.status(200).send({ message: 'not implemented yet' })
}
