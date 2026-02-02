import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyInstance } from 'fastify'

export const authPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    fastify.decorateRequest('user', null)

    fastify.addHook('preHandler', async (request, reply) => {
      request.user = {
        userId: 'fake-user-id',
      }
    })
  },
)
