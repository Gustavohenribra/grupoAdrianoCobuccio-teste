import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
}

const isTestEnv = process.env.NODE_ENV === 'test';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  receiver: User;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({
    type: isTestEnv ? 'varchar' : 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  reversalReason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
