import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsers = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user1@example.com',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user1@example.com',
    role: UserRole.USER,
  };

  const mockUsersService = {
    findAll: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const jwtUser = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(jwtUser);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith(jwtUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const findAllMock = mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(findAllMock).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });
});
