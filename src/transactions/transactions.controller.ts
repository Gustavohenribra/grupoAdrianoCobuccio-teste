import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { DepositDto } from './dto/deposit.dto';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  id: number;
  email: string;
}

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('transfer')
  async transfer(
    @Request() req: { user: JwtUser },
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const senderId: number = req.user.id;
    return this.transactionsService.transfer(senderId, createTransactionDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('reverse/:id')
  async reverseTransaction(
    @Param('id', ParseIntPipe) transactionId: number,
    @Request() req: { user: JwtUser },
    @Body() reverseTransactionDto: ReverseTransactionDto,
  ) {
    const userId = req.user.id;
    return this.transactionsService.reverseTransaction(
      transactionId,
      userId,
      reverseTransactionDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('deposit')
  async deposit(
    @Request() req: { user: JwtUser },
    @Body() depositDto: DepositDto,
  ) {
    const userId = req.user.id;
    return this.transactionsService.deposit(userId, depositDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }
}
