import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PUBLIC_ROUTE_KEY } from './public.decorator';
import { ClerkService } from './clerk.service';
import type { AuthUser } from './current-user.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly clerk: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { auth?: AuthUser }>();

    if (!this.clerk.hasSecret) {
      if (process.env.DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
        const devUser = req.header('x-dev-user-id');
        if (!devUser) {
          throw new UnauthorizedException(
            'DEV_AUTH_BYPASS is on but x-dev-user-id header is missing',
          );
        }
        req.auth = { clerkUserId: devUser };
        return true;
      }
      throw new ServiceUnavailableException('Clerk auth not configured');
    }

    const authHeader = req.header('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice('Bearer '.length).trim();

    try {
      const verifyToken = (
        this.clerk.client as unknown as {
          verifyToken: (t: string) => Promise<{ sub: string }>;
        }
      ).verifyToken;
      const payload = await verifyToken.call(this.clerk.client, token);
      if (!payload?.sub) {
        throw new UnauthorizedException('Token missing sub');
      }
      req.auth = { clerkUserId: payload.sub };
      return true;
    } catch (err) {
      this.logger.debug(`Clerk token verify failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid bearer token');
    }
  }
}
