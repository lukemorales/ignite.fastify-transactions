import 'dotenv/config';
import knex, { type Knex } from 'knex';

import { ENV } from '../config/env';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing database url environment variable');
}

export const knexConfig = {
  client: ENV.DATABASE_CLIENT,
  useNullAsDefault: true,
  connection: {
    filename: ENV.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './src/db/migrations',
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
    transactions_composite: Knex.CompositeTableType<
      Transaction,
      Omit<Transaction, 'created_at'>
    >;
  }
}
