import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient, type ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private _client: ClerkClient | null = null;

  get client(): ClerkClient {
    if (this._client) return this._client;
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }
    this._client = createClerkClient({ secretKey });
    return this._client;
  }

  get hasSecret(): boolean {
    return Boolean(process.env.CLERK_SECRET_KEY);
  }

  get webhookSecret(): string | null {
    return process.env.CLERK_WEBHOOK_SECRET || null;
  }

  warnIfMissing(): void {
    if (!this.hasSecret) {
      this.logger.warn(
        'CLERK_SECRET_KEY is not set — Clerk JWT verification will reject all requests unless DEV_AUTH_BYPASS=true',
      );
    }
    if (!this.webhookSecret) {
      this.logger.warn(
        'CLERK_WEBHOOK_SECRET is not set — POST /auth/webhook will return 503',
      );
    }
  }
}
