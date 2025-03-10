import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { DepositDto } from './dto/deposit.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private usersService: UsersService,
    private connection: Connection,
  ) {}

  async transfer(
    senderId: number,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { receiverId, amount } = createTransactionDto;

    if (senderId === receiverId) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }

    const sender = await this.usersService.findById(senderId);
    const receiver = await this.usersService.findById(receiverId);

    if (!sender || !receiver) {
      throw new BadRequestException(
        'Usuário remetente ou destinatário não encontrado',
      );
    }

    if (Number(sender.balance) < amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    return await this.connection.transaction(async (manager) => {
      sender.balance = Number(sender.balance) - amount;
      receiver.balance = Number(receiver.balance) + amount;

      await manager.save(sender);
      await manager.save(receiver);

      const transaction = manager.create(Transaction, {
        sender,
        receiver,
        amount,
        status: TransactionStatus.COMPLETED,
      });
      return await manager.save(transaction);
    });
  }

  async reverseTransaction(
    transactionId: number,
    userId: number,
    reverseTransactionDto?: ReverseTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
      relations: ['sender', 'receiver'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transação já foi revertida');
    }

    if (transaction.sender.id !== userId) {
      throw new BadRequestException(
        'Você não tem permissão para reverter esta transação',
      );
    }

    if (Number(transaction.receiver.balance) < Number(transaction.amount)) {
      throw new BadRequestException(
        'Saldo insuficiente na conta do destinatário para reversão',
      );
    }

    if (reverseTransactionDto && reverseTransactionDto.reason) {
      console.log(
        `Reversão solicitada pelo usuário ${userId}: ${reverseTransactionDto.reason}`,
      );
    }

    return await this.connection.transaction(async (manager) => {
      transaction.sender.balance =
        Number(transaction.sender.balance) + Number(transaction.amount);
      transaction.receiver.balance =
        Number(transaction.receiver.balance) - Number(transaction.amount);

      await manager.save(transaction.sender);
      await manager.save(transaction.receiver);

      transaction.status = TransactionStatus.REVERSED;

      if (reverseTransactionDto && reverseTransactionDto.reason) {
        transaction.reversalReason = reverseTransactionDto.reason;
      }

      return await manager.save(transaction);
    });
  }

  async deposit(userId: number, depositDto: DepositDto): Promise<Transaction> {
    const { amount } = depositDto;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }
    return await this.connection.transaction(async (manager) => {
      user.balance = Number(user.balance) + amount;
      await manager.save(user);

      const depositTransaction = manager.create(Transaction, {
        sender: user,
        receiver: user,
        amount,
        status: TransactionStatus.COMPLETED,
      });
      return await manager.save(depositTransaction);
    });
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });
    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }
    return transaction;
  }
}
