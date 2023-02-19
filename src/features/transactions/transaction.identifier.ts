import { type z } from 'zod';

import { brandedEntityId } from '../../shared/branded-entity-id';

export const TransactionId = brandedEntityId('Transaction');

export type TransactionId = z.infer<typeof TransactionId>;
