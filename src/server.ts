import { app } from './app';
import { ENV } from './shared/env';

void app
  .listen({ port: ENV.PORT })
  // eslint-disable-next-line no-console
  .then(() => console.log(`🚀 Server listening to port ${ENV.PORT}`));
