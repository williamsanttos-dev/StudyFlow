import type { FastifyRequest, FastifyReply } from 'fastify'
import { app } from '@/app'
import { loginSchema } from './auth.schemas'

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // posso evitar mandar request pro gRPC já validando aqui mesmo a entrada, pois se não passar aqui, não passou no register.
  const data = loginSchema.safeParse(request.body)
  if (!data.success) throw app.httpErrors.badRequest('Invalid Credentials')

  // status 404 (not found)

  return reply.status(200).send({ message: 'not implemented yet' })
}
