import type { FastifyRequest, FastifyReply } from 'fastify'
import { TopicRequestSchema } from './topic.schema'
import { app } from '@/app'

export async function updateTopicHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // não quero aceitar payload vazio
  const data = TopicRequestSchema.safeParse(request.body)
  if (!data.success) throw app.httpErrors.badRequest('Invalid payload')

  return reply.status(200).send({ message: 'not implemented yet' })
}
