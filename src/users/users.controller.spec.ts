/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ id: 1, ...dto, balance: 0 }),
      ),
    findAll: jest
      .fn()
      .mockResolvedValue([
        { id: 1, name: 'User One', email: 'user1@example.com', balance: 0 },
      ]),
    findById: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id,
        name: 'User One',
        email: 'user1@example.com',
        balance: 0,
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should register a user', async () => {
    const dto: CreateUserDto = {
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123',
    };
    const result = await controller.register(dto);
    expect(result).toHaveProperty('id');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should list all users', async () => {
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get a user by id', async () => {
    const result = await controller.findOne(1);
    expect(result).toHaveProperty('id', 1);
    expect(service.findById).toHaveBeenCalledWith(1);
  });
});
