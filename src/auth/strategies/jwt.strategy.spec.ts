/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.service';
import { UserRole } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-uuid',
    username: 'test_user',
    email: 'test@example.com',
    role: UserRole.USER,
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const validPayload: JwtPayload = {
      sub: 'user-uuid',
      username: 'test_user',
      email: 'test@example.com',
      role: UserRole.USER,
      type: 'access',
    };

    it('should return user data for valid access token payload', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(validPayload);

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-uuid');
    });

    it('should throw UnauthorizedException if token type is not "access"', async () => {
      const refreshPayload: JwtPayload = {
        ...validPayload,
        type: 'refresh',
      };

      await expect(strategy.validate(refreshPayload)).rejects.toThrow(
        new UnauthorizedException('Invalid token type'),
      );
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findById.mockResolvedValue(null as any);

      await expect(strategy.validate(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findById).toHaveBeenCalledWith('user-uuid');
    });

    it('should handle admin users correctly', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      usersService.findById.mockResolvedValue(adminUser);

      const result = await strategy.validate(validPayload);

      expect(result).toEqual({
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: UserRole.ADMIN,
      });
    });
  });
});
