import type { FastifyRequest, FastifyReply } from 'fastify'
import { registerUserSchema } from './auth.schemas'
import { app } from '@/app'

export async function registerUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = registerUserSchema.safeParse(request.body)
  if (!data.success)
    throw app.httpErrors.badRequest(data.error.issues[0].message)

  console.log(data)

  // status 409 (Conflict)

  return reply.status(200).send({ message: 'not implemented yet' })
}
