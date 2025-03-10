/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { UsersService } from '../users/users.service';
import { Connection } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let usersService: Partial<UsersService>;
  let connection: Partial<Connection>;

  let sender: any;
  let receiver: any;
  let transactionEntity: any;

  beforeEach(async () => {
    sender = {
      id: 1,
      name: 'Sender',
      email: 'sender@example.com',
      password: 'hashed',
      balance: 500,
      createdAt: new Date(),
    };
    receiver = {
      id: 2,
      name: 'Receiver',
      email: 'receiver@example.com',
      password: 'hashed',
      balance: 100,
      createdAt: new Date(),
    };

    transactionEntity = {
      id: 1,
      sender,
      receiver,
      amount: 100,
      status: TransactionStatus.COMPLETED,
      createdAt: new Date(),
    };

    usersService = {
      findById: jest.fn().mockImplementation((id: number) => {
        if (id === sender.id) return Promise.resolve(sender);
        if (id === receiver.id) return Promise.resolve(receiver);
        return Promise.resolve(null);
      }),
    };

    const mockTransactionRepository = {
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn().mockImplementation((options: any) => {
        if (options.where && options.where.id === transactionEntity.id) {
          return Promise.resolve({ ...transactionEntity });
        }
        return Promise.resolve(null);
      }),
      find: jest.fn().mockResolvedValue([transactionEntity]),
    };

    connection = {
      transaction: jest.fn().mockImplementation(async (cb: any) => {
        const manager = {
          save: jest
            .fn()
            .mockImplementation((entity: any) => Promise.resolve(entity)),
          create: jest.fn().mockImplementation((Entity: any, dto: any) => {
            if (Entity === Transaction) {
              return { ...dto, id: 1, createdAt: new Date() };
            }
            return dto;
          }),
        };
        return await cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: Connection, useValue: connection },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should transfer amount successfully', async () => {
    const createTransactionDto = { receiverId: receiver.id, amount: 100 };
    const transaction = await service.transfer(sender.id, createTransactionDto);
    expect(transaction).toHaveProperty('id');
    expect(transaction.status).toEqual(TransactionStatus.COMPLETED);
    expect(sender.balance).toEqual(500 - 100);
    expect(receiver.balance).toEqual(100 + 100);
  });

  it('should throw error if sender equals receiver', async () => {
    await expect(
      service.transfer(sender.id, { receiverId: sender.id, amount: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw error if sender has insufficient balance', async () => {
    (usersService.findById as jest.Mock).mockResolvedValueOnce({
      ...sender,
      balance: 50,
    });
    await expect(
      service.transfer(sender.id, { receiverId: receiver.id, amount: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reverse transaction successfully', async () => {
    const reverseTransactionDto = { reason: 'Test reversal' };
    const reversedTransaction = await service.reverseTransaction(
      transactionEntity.id,
      sender.id,
      reverseTransactionDto,
    );
    expect(reversedTransaction.status).toEqual(TransactionStatus.REVERSED);
    expect(reversedTransaction.reversalReason).toEqual('Test reversal');
  });

  it('should throw NotFoundException when transaction not found', async () => {
    await expect(
      service.reverseTransaction(999, sender.id, { reason: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should deposit successfully', async () => {
    const depositDto = { amount: 200 };
    const depositTransaction = await service.deposit(sender.id, depositDto);
    expect(depositTransaction).toHaveProperty('id');
    expect(depositTransaction.amount).toEqual(depositDto.amount);
    expect(depositTransaction.sender.id).toEqual(sender.id);
    expect(depositTransaction.receiver.id).toEqual(sender.id);
  });

  it('should throw error if user not found on deposit', async () => {
    (usersService.findById as jest.Mock).mockResolvedValueOnce(null);
    await expect(service.deposit(999, { amount: 200 })).rejects.toThrow(
      BadRequestException,
    );
  });
});
