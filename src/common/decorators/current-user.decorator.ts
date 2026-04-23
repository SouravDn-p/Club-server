import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../types/commonAuthTypes';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
