/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'test@example.com',
        role: UserRole.USER,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should return true if user has required role (ADMIN)', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'user@example.com',
        role: UserRole.USER,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return true if user has one of multiple required roles', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.USER]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true if USER role matches required USER role', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'user@example.com',
        role: UserRole.USER,
      });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.USER]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should handle empty roles array', () => {
      const mockContext = createMockExecutionContext({
        id: '1',
        email: 'user@example.com',
        role: UserRole.USER,
      });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should create instance with reflector', () => {
      const newGuard = new RolesGuard(reflector);
      expect(newGuard).toBeInstanceOf(RolesGuard);
    });
  });
});
