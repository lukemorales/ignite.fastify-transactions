import { type FastifyInstance } from 'fastify';

import { pipe } from '@fp-ts/core/Function';
import { ulid } from 'ulid';
import { z } from 'zod';

import { db } from '../../shared/database';
import { O } from '../../shared/fp-ts';

// eslint-disable-next-line @typescript-eslint/require-await
export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await db('transactions').select();

    return { transactions };
  });

  app.get('/:id', async (request, response) => {
    const schema = z.object({
      id: z.string(),
    });

    const { id } = pipe(request.params, schema.parse);

    const transaction = await db('transactions').where('id', id).first();

    return pipe(
      transaction,
      O.fromNullable,
      O.match(
        () => response.status(404).send(),
        (data) => ({ transaction: data }),
      ),
    );
  });

  app.post('/', async (request, response) => {
    const schema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['CREDIT', 'DEBIT']),
    });

    const { title, amount, type } = pipe(request.body, schema.parse);

    await db('transactions').insert({
      id: ulid(),
      title,
      amount: type === 'CREDIT' ? amount : amount * -1,
      session_id: ulid(),
    });

    return response.status(201).send();
  });
}
