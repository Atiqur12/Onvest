import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface AuthUser {
  clerkUserId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ auth?: AuthUser }>();
    if (!req.auth) {
      throw new Error('CurrentUser used on a route without auth context');
    }
    return req.auth;
  },
);
