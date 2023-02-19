import { type FastifyReply, type FastifyRequest } from 'fastify';

// eslint-disable-next-line consistent-return
export async function sessionMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.session_id;

  if (!sessionId) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}
