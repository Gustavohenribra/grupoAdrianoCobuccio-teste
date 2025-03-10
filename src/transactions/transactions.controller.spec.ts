/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { DepositDto } from './dto/deposit.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    transfer: jest
      .fn()
      .mockImplementation((senderId, dto) =>
        Promise.resolve({ id: 1, senderId, ...dto }),
      ),
    reverseTransaction: jest
      .fn()
      .mockImplementation((id, userId, dto) =>
        Promise.resolve({ id, status: 'REVERSED', reversalReason: dto.reason }),
      ),
    deposit: jest
      .fn()
      .mockImplementation((userId, dto) =>
        Promise.resolve({ id: 1, userId, amount: dto.amount }),
      ),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockImplementation((id) => Promise.resolve({ id })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should transfer transaction', async () => {
    const dto: CreateTransactionDto = { receiverId: 2, amount: 100 };
    const req = { user: { id: 1, email: 'test@example.com' } };
    const result = await controller.transfer(req, dto);
    expect(result).toHaveProperty('id');
    expect(service.transfer).toHaveBeenCalledWith(req.user.id, dto);
  });

  it('should reverse transaction', async () => {
    const dto: ReverseTransactionDto = { reason: 'Test reversal' };
    const req = { user: { id: 1, email: 'test@example.com' } };
    const result = await controller.reverseTransaction(1, req, dto);
    expect(result).toHaveProperty('status', 'REVERSED');
    expect(service.reverseTransaction).toHaveBeenCalledWith(
      1,
      req.user.id,
      dto,
    );
  });

  it('should deposit transaction', async () => {
    const dto: DepositDto = { amount: 200 };
    const req = { user: { id: 1, email: 'test@example.com' } };
    const result = await controller.deposit(req, dto);
    expect(result).toHaveProperty('id');
    expect(service.deposit).toHaveBeenCalledWith(req.user.id, dto);
  });

  it('should list all transactions', async () => {
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get one transaction', async () => {
    const result = await controller.findOne(1);
    expect(result).toHaveProperty('id', 1);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });
});
