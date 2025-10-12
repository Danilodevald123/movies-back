import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../interfaces/jwt-user.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtUser | undefined,
    ctx: ExecutionContext,
  ): JwtUser | string | null => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    const user = request.user;

    return data ? user[data] : user;
  },
);
