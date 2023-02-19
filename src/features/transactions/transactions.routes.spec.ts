/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { execSync } from 'node:child_process';
import request from 'supertest';

import { app } from '../../app';
import { type Transaction } from './transaction.entity';

describe('transactionsRoutes()', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    execSync('pnpm run knex migrate:rollback --all');
    execSync('pnpm run knex migrate:latest');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /', () => {
    it('creates a new transaction', async () => {
      const response = await request(app.server)
        .post('/transactions')
        .send({
          title: 'New transaction',
          amount: 5000,
          type: 'CREDIT',
        })
        .expect(201);

      expect(response.body).toEqual({
        transaction: expect.objectContaining({
          id: expect.stringContaining('transaction_'),
        }),
      });
    });
  });

  describe('GET /', () => {
    it('returns the list of transactions for the current session', async () => {
      const creationResponse = await request(app.server)
        .post('/transactions')
        .send({
          title: 'New transaction',
          amount: 5000,
          type: 'CREDIT',
        });

      const cookies = creationResponse.get('Set-Cookie');

      const response = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toEqual({
        transactions: [
          expect.objectContaining({
            title: 'New transaction',
            amount: 5000,
          }),
        ],
      });
    });
  });

  describe('GET /:id', () => {
    it('returns a specific transaction', async () => {
      const response = await request(app.server).post('/transactions').send({
        title: 'New transaction',
        amount: 5000,
        type: 'CREDIT',
      });

      const { transaction } = response.body as { transaction: Transaction };

      const cookies = response.get('Set-Cookie');

      const result = await request(app.server)
        .get(`/transactions/${transaction.id}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(result.body).toEqual({
        transaction: expect.objectContaining({
          id: transaction.id,
        }),
      });
    });
  });

  describe('GET /summary', () => {
    it('returns the summary of all transactions', async () => {
      const response = await request(app.server).post('/transactions').send({
        title: 'New transaction',
        amount: 5000,
        type: 'CREDIT',
      });

      const cookies = response.get('Set-Cookie');

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
          title: 'New transaction',
          amount: 3000,
          type: 'DEBIT',
        });

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
          title: 'New transaction',
          amount: 1000,
          type: 'DEBIT',
        });

      const result = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200);

      expect(result.body).toEqual({
        summary: { amount: 1000 },
      });
    });
  });
});
