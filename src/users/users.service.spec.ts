import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<User>;

  const userArray = [
    {
      id: 1,
      name: 'User One',
      email: 'user1@example.com',
      password: 'hashed1',
      balance: 0,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'User Two',
      email: 'user2@example.com',
      password: 'hashed2',
      balance: 0,
      createdAt: new Date(),
    },
  ];

  const mockRepository = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest
      .fn()
      .mockImplementation((user) => Promise.resolve({ id: 1, ...user })),
    findOne: jest.fn().mockImplementation(({ where: { email, id } }) => {
      if (email) return userArray.find((u) => u.email === email) || null;
      if (id) return userArray.find((u) => u.id === id) || null;
      return null;
    }),
    update: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue(userArray),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user successfully', async () => {
    const createUserDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };
    mockRepository.findOne.mockResolvedValueOnce(null);

    const user = await service.create(createUserDto);
    expect(user).toHaveProperty('id');
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createUserDto.name,
        email: createUserDto.email,
        balance: 0,
      }),
    );
  });

  it('should throw ConflictException when email exists', async () => {
    const createUserDto = {
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123',
    };
    mockRepository.findOne.mockResolvedValueOnce(userArray[0]);
    await expect(service.create(createUserDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should find a user by email', async () => {
    const user = await service.findByEmail('user1@example.com');
    expect(user).toBeDefined();
    expect(user!.email).toEqual('user1@example.com');
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });

  it('should update user balance', async () => {
    await service.updateBalance(1, 100);
    expect(mockRepository.update).toHaveBeenCalled();
  });
});
