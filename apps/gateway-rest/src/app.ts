import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'
import sensible from '@fastify/sensible'

import { authPlugin } from './plugins/auth'
import { authRoutes } from './modules/auth/routes'
import { topicRoutes } from './modules/topics/routes'
import { subTopicsRoutes } from './modules/subtopics/routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(sensible)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentials: true,
  // credentials or JWT sessions?
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Study Flow API',
      description: 'API for monitor progress in studies',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

// PLUGINS
app.register(authPlugin)

// ROUTES
app.get('/health', (request, reply) => {
  reply.status(200).send({ message: 'OK' })
})
app.register(ScalarApiReference, {
  routePrefix: '/docs',
})
app.register(authRoutes, { prefix: '/v1/auth' })
app.register(topicRoutes, { prefix: 'v1/topics' })
app.register(subTopicsRoutes, { prefix: '/1/subtopics' })
