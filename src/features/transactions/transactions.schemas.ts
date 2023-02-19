import { z } from 'zod';

export const createTransaction = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['CREDIT', 'DEBIT']),
});
