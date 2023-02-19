import fastify, { type FastifyPluginAsync } from 'fastify';
import fastifyCookie from '@fastify/cookie';

import { ENV } from './shared/env';
import { transactionsRoutes } from './features/transactions';

const app = fastify();

void app.register(fastifyCookie);

const routes: Array<[string, FastifyPluginAsync]> = [
  ['transactions', transactionsRoutes],
];

routes.forEach(([prefix, route]) => {
  void app.register(route, { prefix });
});

void app
  .listen({ port: ENV.PORT })
  // eslint-disable-next-line no-console
  .then(() => console.log(`🚀 Server listening to port ${ENV.PORT}`));
