import 'dotenv/config';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['pg', 'sqlite']).default('sqlite'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  throw fromZodError(result.error);
}

export const ENV = result.data;
