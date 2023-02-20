import { exhaustive } from 'exhaustive';
import knex, { type Knex } from 'knex';

import { ENV } from './env';

export const knexConfig = {
  client: ENV.DATABASE_CLIENT,
  useNullAsDefault: true,
  connection: exhaustive(ENV.DATABASE_CLIENT, {
    pg: () => ENV.DATABASE_URL,
    sqlite: () => ({ filename: ENV.DATABASE_URL }),
  }),
  migrations: {
    extension: 'ts',
    directory: './src/migrations',
  },
} as const satisfies Knex.Config;

export const db = knex(knexConfig);

declare module 'knex/types/tables' {
  interface Transaction {
    id: string;
    title: string;
    amount: number;
    session_id: string;
    created_at: Date;
  }

  interface Tables {
    transactions: Transaction;
  }
}
