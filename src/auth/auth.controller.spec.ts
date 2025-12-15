import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Types } from 'mongoose';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', () => {
      const mockRequest = {
        user: {
          userId: '123',
          email: 'test@example.com',
        },
      } as any;

      const mockResponse = {
        access_token: 'jwt-token-123',
      };

      mockAuthService.login.mockReturnValue(mockResponse);

      const result = controller.login(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockRequest.user);
    });
  });

  describe('register', () => {
    it('should register user and return user without password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = {
        _id: new Types.ObjectId(),
        email: registerDto.email,
        name: registerDto.name,
        password: 'hashedPassword',
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(),
          email: registerDto.email,
          name: registerDto.name,
          password: 'hashedPassword',
        }),
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', registerDto.email);
      expect(result).toHaveProperty('name', registerDto.name);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockRequest = {
        user: {
          userId: '123',
          email: 'test@example.com',
        },
      } as any;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });
});
