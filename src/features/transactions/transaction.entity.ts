import { z } from 'zod';

import { TransactionId } from './transaction.identifier';

export const TransactionEntity = z.strictObject({
  id: TransactionId,
  title: z.string(),
  amount: z.number(),
  createdAt: z.coerce.date(),
});

export interface TransactionInput extends z.input<typeof TransactionEntity> {}

export interface TransactionEntity extends z.infer<typeof TransactionEntity> {}

export class Transaction implements TransactionEntity {
  id: TransactionId;

  title: string;

  amount: number;

  createdAt: Date;

  constructor(input: TransactionInput) {
    Object.assign(this, TransactionEntity.parse(input));
  }
}
