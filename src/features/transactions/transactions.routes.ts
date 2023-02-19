import { type FastifyInstance } from 'fastify';

import { flow, pipe } from '@fp-ts/core/Function';
import { ulid } from 'ulid';
import { z } from 'zod';

import { db } from '../../shared/database';
import { A, O } from '../../shared/fp-ts';
import { TransactionId } from './transaction.identifier';
import { unprefixId } from '../../shared/unprefix-id';
import { TransactionAdapter } from './transaction.adapter';

// eslint-disable-next-line @typescript-eslint/require-await
export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await db('transactions').select();

    return {
      transactions: pipe(
        transactions,
        A.map(flow(TransactionAdapter.toDomain, TransactionAdapter.toJSON)),
      ),
    };
  });

  app.get('/summary', async () => {
    const result = await db('transactions')
      .sum('amount', { as: 'amount' })
      .first();

    return pipe(
      result,
      O.fromNullable,
      O.match(
        () => 0,
        ({ amount: summary }) => ({ summary }),
      ),
    );
  });

  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({ id: TransactionId });

    const { id } = pipe(request.params, paramsSchema.parse);

    const record = await db('transactions').where('id', unprefixId(id)).first();

    return pipe(
      record,
      O.fromNullable,
      O.map(flow(TransactionAdapter.toDomain, TransactionAdapter.toJSON)),
      O.match(
        () => reply.status(404).send(),
        (transaction) => ({ transaction }),
      ),
    );
  });

  app.post('/', async (request, response) => {
    const bodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['CREDIT', 'DEBIT']),
    });

    const { title, amount, type } = pipe(request.body, bodySchema.parse);

    await db('transactions').insert({
      id: ulid(),
      title,
      amount: type === 'CREDIT' ? amount : amount * -1,
      session_id: ulid(),
    });

    return response.status(201).send();
  });
}
