import type { FastifyRequest, FastifyReply } from 'fastify'

export async function createTopicHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({ message: 'not implemented yet' })
}
