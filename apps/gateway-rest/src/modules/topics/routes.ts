import type { FastifyInstance } from 'fastify'
import { getTopicsHandler } from './get-topics.handler'
import { getTopicHandler } from './get-topic.handler'
import { createTopicHandler } from './create-topic.handler'
import { updateTopicHandler } from './update-topic.handler'
import { deleteTopicHandler } from './delete-topic.handler'

export async function topicRoutes(app: FastifyInstance) {
  app.post('/', createTopicHandler)
  app.get('/', getTopicsHandler) // Query
  app.get('/:topicId', getTopicHandler) // Query
  app.patch('/:topicId', updateTopicHandler)
  app.delete('/:topicId', deleteTopicHandler)
}
