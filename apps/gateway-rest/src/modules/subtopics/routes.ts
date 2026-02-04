import type { FastifyInstance } from 'fastify'
import { createSubTopicHandler } from './create-subtopics.handler'
import { getSubTopicsHandler } from './get-subtopics.handler'
import { getSubTopicHandler } from './get-subtopic.handler'
import { updateSubTopicHandler } from './update-subtopics.handler'
import { deleteSubTopicHandler } from './delete-subtopics.handler'
import { markSubtopicDoneHandler } from './mark-done-subtopic.handler'

export async function subTopicsRoutes(app: FastifyInstance) {
  app.post('/:topicId', createSubTopicHandler)
  app.get('/:topicId', getSubTopicsHandler) // Query
  app.get('/:topicId/:subtopicId', getSubTopicHandler) // Query
  app.patch('/:topicId/:subtopicId', updateSubTopicHandler)
  app.delete('/:topicId/:subtopicId', deleteSubTopicHandler)
  app.patch('/:topicId/:subtopicId/done', markSubtopicDoneHandler)
}
