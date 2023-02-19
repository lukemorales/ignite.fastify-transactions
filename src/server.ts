import fastify from 'fastify';

import { ulid } from 'ulid';

import { ENV } from './config/env';
import { db } from './db/database-config';

const app = fastify();

app.get('/health', async () => {
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

void app
  .listen({ port: ENV.PORT })
  // eslint-disable-next-line no-console
  .then(() => console.log(`🚀 Server listening to port ${ENV.PORT}`));
