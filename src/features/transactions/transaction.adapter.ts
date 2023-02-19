import { type Tables } from 'knex/types/tables';

import { Transaction } from './transaction.entity';

export class TransactionAdapter {
  static toDomain(model: Tables['transactions']) {
    return new Transaction({
      id: model.id,
      title: model.title,
      amount: model.amount,
      createdAt: model.created_at,
    });
  }

  static toJSON(domain: Transaction) {
    return domain;
  }
}
