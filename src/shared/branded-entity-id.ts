import { flow, pipe } from '@fp-ts/core/Function';
import { z } from 'zod';

import { S } from './fp-ts';
import { unprefixId } from './unprefix-id';

export const ulidSchema = () =>
  z
    .string()
    .refine((val) => /[0-9A-HJKMNP-TV-Z]{26}/.test(val), 'Invalid ULID');

export const brandedEntityId = <Entity extends string>(
  entity: Entity,
  prefix?: string,
) => {
  const transformPrefix = flow(
    S.split(/\.?(?=[A-Z])/),
    (parts) => parts.join('_'),
    S.toLowerCase,
  );

  const brandedPrefix = z
    .string()
    .min(1)
    .transform(transformPrefix)
    .catch(transformPrefix(entity))
    .parse(prefix);

  return (
    ulidSchema()
      .describe(`Branded id for domain of entity ${entity}`)
      // eslint-disable-next-line consistent-return
      .superRefine((id, ctx) => {
        const pieces = pipe(id, S.split('_'));

        const [prefixOrId] = pieces;
        const valueHasEntityPrefix = pieces.length !== 1;

        if (valueHasEntityPrefix && prefixOrId !== brandedPrefix) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            validation: 'regex',
            path: ['id prefix', prefixOrId],
            message: `Invalid entity id "${id}", if you're trying to use the same value from another entity, make sure to unprefix it first`,
            fatal: true,
          });

          return z.NEVER;
        }
      })
      .transform((id) => `${brandedPrefix}_${unprefixId(id)}`)
      .brand<`${Entity}Id`>()
  );
};
