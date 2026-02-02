import type { FastifyInstance } from 'fastify'
import { loginHandler } from './login.handler'
import { refreshTokenHandler } from './refresh-token.handler'
import { registerUserHandler } from './register-user.handler'
import { fetchUserHandler } from './fetch-user.handler'

export async function authRoutes(app: FastifyInstance) {
  app.get('/me', fetchUserHandler)
  app.post('/register', registerUserHandler)
  app.post('/login', loginHandler)
  app.post('/refresh', refreshTokenHandler)
}
