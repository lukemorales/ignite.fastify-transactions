import fastify from 'fastify';

import { ENV } from './shared/env';
import { transactionsRoutes } from './features/transactions';

const app = fastify();

const routes = [[transactionsRoutes, 'transactions']] as const;

routes.forEach(([route, prefix]) => {
  void app.register(route, { prefix });
});

void app
  .listen({ port: ENV.PORT })
  // eslint-disable-next-line no-console
  .then(() => console.log(`🚀 Server listening to port ${ENV.PORT}`));
