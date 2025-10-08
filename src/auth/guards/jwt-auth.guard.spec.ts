/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should use reflector to check IS_PUBLIC_KEY metadata', () => {
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      const spy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      guard.canActivate(mockExecutionContext);

      expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should check both handler and class for metadata', () => {
      const handler = jest.fn();
      const classRef = jest.fn();
      const mockExecutionContext = {
        getHandler: () => handler,
        getClass: () => classRef,
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        expect.arrayContaining([handler, classRef]),
      );
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should create instance with reflector', () => {
      const newGuard = new JwtAuthGuard(reflector);
      expect(newGuard).toBeInstanceOf(JwtAuthGuard);
    });
  });
});
