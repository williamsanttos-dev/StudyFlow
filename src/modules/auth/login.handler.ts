import type { FastifyRequest, FastifyReply } from 'fastify'

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  console.log(request.user)
  return reply.status(200).send({ message: 'not implemented yet' })
}
