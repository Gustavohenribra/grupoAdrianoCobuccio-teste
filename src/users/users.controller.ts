import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { instanceToPlain } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user: User = await this.usersService.create(createUserDto);
    return instanceToPlain(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(): Promise<any[]> {
    const users = await this.usersService.findAll();
    return instanceToPlain(users) as any[];
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    const user = await this.usersService.findById(id);
    return instanceToPlain(user);
  }
}
