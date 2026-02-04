import type { FastifyRequest, FastifyReply } from 'fastify'

export async function markSubtopicDoneHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  reply.status(200).send({ message: 'not implemented yet' })
}
