import { type FastifyInstance } from 'fastify';

import { pipe } from '@fp-ts/core/Function';
import { ulid } from 'ulid';
import { z } from 'zod';

import { db } from '../../db/database-config';
import { createTransaction } from './transactions.schemas';

// eslint-disable-next-line @typescript-eslint/require-await
export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const { title, amount, type } = pipe(request.body, createTransaction.parse);

    await db('transactions').insert({
      id: ulid(),
      title,
      amount: type === 'CREDIT' ? amount : amount * -1,
      session_id: ulid(),
    });

    return response.status(201).send();
  });
}
