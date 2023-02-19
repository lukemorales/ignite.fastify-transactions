import fastify, { type FastifyPluginAsync } from 'fastify';
import fastifyCookie from '@fastify/cookie';

import { transactionsRoutes } from './features/transactions';

const app = fastify();

void app.register(fastifyCookie);

const routes: Array<[string, FastifyPluginAsync]> = [
  ['transactions', transactionsRoutes],
];

routes.forEach(([prefix, route]) => {
  void app.register(route, { prefix });
});

export { app };
