import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z
    .enum([
      'mysql',
      'pg',
      'postgres',
      'sqlite',
      'sqlite3',
      'better-sqlite3',
      'oracledb',
    ])
    .default('sqlite'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
});

export const ENV = schema.parse(process.env);
