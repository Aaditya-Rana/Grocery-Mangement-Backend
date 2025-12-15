import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

jest.mock('bcryptjs');

const mockUsersService = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user payload when credentials are valid', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(),
          email: 'test@example.com',
          password: 'hashedPassword',
        }),
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        userId: mockUser._id.toString(),
        email: mockUser.email,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
        toObject: jest.fn(),
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
    });
  });

  describe('login', () => {
    it('should return access token', () => {
      const userPayload = {
        userId: '123',
        email: 'test@example.com',
      };
      const mockToken = 'jwt-token-123';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(userPayload);

      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: userPayload.email,
        sub: userPayload.userId,
      });
    });
  });

  describe('register', () => {
    it('should call usersService.create with registerDto', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const mockUser = {
        _id: new Types.ObjectId(),
        email: registerDto.email,
        name: registerDto.name,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });
  });
});
