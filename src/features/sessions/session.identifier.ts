import { type z } from 'zod';

import { brandedEntityId } from '../../shared/branded-entity-id';

export const SessionId = brandedEntityId('Session');

export type SessionId = z.infer<typeof SessionId>;
