import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

jest.mock('bcryptjs');

class MockUserModel {
  data: any;
  save: jest.Mock;

  constructor(dto: any) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue(this.data);
  }

  static findOne = jest.fn();
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'plainPassword',
        name: 'Test User',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockSavedUser = {
        _id: new Types.ObjectId(),
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      };

      const mockInstance = new MockUserModel({
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      });
      mockInstance.save = jest.fn().mockResolvedValue(mockSavedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(result).toHaveProperty('email', mockSavedUser.email);
      expect(result).toHaveProperty('name', mockSavedUser.name);
      expect(result).toHaveProperty('password', hashedPassword);
    });

    it('should hash password before saving', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      const execMock = jest.fn().mockResolvedValue(mockUser);
      MockUserModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(MockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(execMock).toHaveBeenCalled();
    });

    it('should return null when user is not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      MockUserModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findOne('nonexistent@example.com');

      expect(result).toBeNull();
      expect(MockUserModel.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
    });
  });
});
