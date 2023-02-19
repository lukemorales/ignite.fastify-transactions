import { type FastifyInstance } from 'fastify';

import { flow, pipe } from '@fp-ts/core/Function';
import { ulid } from 'ulid';
import { z } from 'zod';
import { hoursToMilliseconds } from 'date-fns/fp';
import { multiply } from '@fp-ts/core/Number';

import { db } from '../../shared/database';
import { A, O } from '../../shared/fp-ts';
import { TransactionId } from './transaction.identifier';
import { unprefixId } from '../../shared/unprefix-id';
import { TransactionAdapter } from './transaction.adapter';
import { SessionId } from '../sessions/session.identifier';
import { sessionMiddleware } from '../sessions/sessions.middleware';

// eslint-disable-next-line @typescript-eslint/require-await
export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [sessionMiddleware] }, async (request) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sessionId = request.cookies.session_id!;

    const transactions = await db('transactions')
      .where('session_id', unprefixId(sessionId))
      .select();

    return {
      transactions: pipe(
        transactions,
        A.map(flow(TransactionAdapter.toDomain, TransactionAdapter.toJSON)),
      ),
    };
  });

  app.get(
    '/:id',
    { preHandler: [sessionMiddleware] },
    async (request, reply) => {
      const paramsSchema = z.object({ id: TransactionId });

      const { id } = pipe(request.params, paramsSchema.parse);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const sessionId = request.cookies.session_id!;

      const record = await db('transactions')
        .where({
          id: unprefixId(id),
          session_id: unprefixId(sessionId),
        })
        .first();

      return pipe(
        record,
        O.fromNullable,
        O.map(flow(TransactionAdapter.toDomain, TransactionAdapter.toJSON)),
        O.match(
          () => reply.status(404).send(),
          (transaction) => ({ transaction }),
        ),
      );
    },
  );

  app.get('/summary', { preHandler: [sessionMiddleware] }, async (request) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sessionId = request.cookies.session_id!;

    const result = await db('transactions')
      .where('session_id', unprefixId(sessionId))
      .sum('amount', { as: 'amount' })
      .first();

    return pipe(
      result,
      O.fromNullable,
      O.match(
        () => ({ summary: { amount: 0 } }),
        (summary) => ({ summary }),
      ),
    );
  });

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['CREDIT', 'DEBIT']),
    });

    const { title, amount, type } = pipe(request.body, bodySchema.parse);

    let sessionId = request.cookies.session_id;

    if (!sessionId) {
      sessionId = SessionId.parse(ulid());

      void reply.cookie('session_id', sessionId, {
        path: '/',
        maxAge: pipe(24, hoursToMilliseconds, multiply(7)), // 7 days
      });
    }

    const [record] = await db('transactions')
      .insert({
        id: ulid(),
        title,
        amount: type === 'CREDIT' ? amount : amount * -1,
        session_id: unprefixId(sessionId),
      })
      .returning('*');

    return pipe(
      record,
      O.fromNullable,
      O.map(flow(TransactionAdapter.toDomain, TransactionAdapter.toJSON)),
      O.match(
        () =>
          reply.status(500).send({ message: 'Failed to create transaction' }),
        (transaction) => reply.status(201).send({ transaction }),
      ),
    );
  });
}
