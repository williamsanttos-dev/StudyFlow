import type { FastifyRequest, FastifyReply } from 'fastify'

export async function deleteTopicHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({ message: 'not implemented yet' })
}
