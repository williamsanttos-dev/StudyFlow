import type { FastifyRequest, FastifyReply } from 'fastify'
import { app } from '@/app'
import { TopicRequestSchema } from './topic.schema'

export async function createTopicHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = TopicRequestSchema.safeParse(request.body)
  if (!data.success) throw app.httpErrors.badRequest('Invalid payload')

  return reply.status(200).send({ message: 'not implemented yet' })
}
