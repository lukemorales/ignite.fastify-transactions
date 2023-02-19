import { type FastifyInstance } from 'fastify';

import { ulid } from 'ulid';

import { db } from '../../db/database-config';

export function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const data = await db('transactions')
      .insert({
        id: ulid(),
        title: 'Test transaction',
        amount: 1000,
        session_id: ulid(),
      })
      .returning('*');

    return { data };
  });
}
