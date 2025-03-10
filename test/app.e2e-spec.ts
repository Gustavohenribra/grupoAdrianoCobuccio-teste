import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('E2E Test Suite', () => {
  let app: INestApplication;
  let tokenUser1: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tokenUser2: string;
  let user1Id: number;
  let user2Id: number;
  let transactionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Register user1', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123',
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    user1Id = res.body.id;
  });

  it('Register user2', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123',
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    user2Id = res.body.id;
  });

  it('Login user1', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@example.com',
        password: 'password123',
      })
      .expect(201);
    expect(res.body).toHaveProperty('access_token');
    tokenUser1 = res.body.access_token;
  });

  it('Login user2', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user2@example.com',
        password: 'password123',
      })
      .expect(201);
    expect(res.body).toHaveProperty('access_token');
    tokenUser2 = res.body.access_token;
  });

  it('Deposit to user1', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions/deposit')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ amount: 500 })
      .expect(201);
    expect(res.body).toHaveProperty('id');
  });

  it('Transfer from user1 to user2', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions/transfer')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        receiverId: user2Id,
        amount: 100,
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    transactionId = res.body.id;
  });

  it('List all transactions', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('Get transaction by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', transactionId);
  });

  it('Reverse the transaction by user1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/transactions/reverse/${transactionId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ reason: 'Erro no envio' })
      .expect(201);
    expect(res.body).toHaveProperty('status', 'REVERSED');
    expect(res.body).toHaveProperty('reversalReason', 'Erro no envio');
  });

  it('List all users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('Get user by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', user1Id);
  });
});
