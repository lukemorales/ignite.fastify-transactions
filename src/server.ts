import fastify from 'fastify';

const app = fastify();

void app
  .listen({ port: 3333 })
  // eslint-disable-next-line no-console
  .then(() => console.log('🚀 Server listening to port 3333'));
