/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';
import { JwtUser } from '../interfaces/jwt-user.interface';
import { UserRole } from '../../users/entities/user.entity';

describe('CurrentUser Decorator', () => {
  const mockUser: JwtUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    role: UserRole.USER,
  };

  const createMockExecutionContext = (user: JwtUser): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function getParamDecoratorFactory(decorator: Function) {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public test(@decorator() value: unknown) {}
    }

    const args = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    return args[Object.keys(args)[0]].factory;
  }

  it('should return the entire user object when no data is provided', () => {
    const ctx = createMockExecutionContext(mockUser);
    const factory = getParamDecoratorFactory(CurrentUser);
    const result = factory(undefined, ctx);

    expect(result).toEqual(mockUser);
  });

  it('should return specific user property when data key is provided', () => {
    const ctx = createMockExecutionContext(mockUser);
    const factory = getParamDecoratorFactory(CurrentUser);

    const emailResult = factory('email', ctx);
    expect(emailResult).toBe('test@example.com');

    const idResult = factory('id', ctx);
    expect(idResult).toBe('user-uuid');

    const roleResult = factory('role', ctx);
    expect(roleResult).toBe(UserRole.USER);
  });

  it('should work with admin users', () => {
    const adminUser: JwtUser = {
      ...mockUser,
      role: UserRole.ADMIN,
    };
    const ctx = createMockExecutionContext(adminUser);
    const factory = getParamDecoratorFactory(CurrentUser);

    const result = factory(undefined, ctx);
    expect(result).toEqual(adminUser);

    const roleResult = factory('role', ctx);
    expect(roleResult).toBe(UserRole.ADMIN);
  });
});
