import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Repository } from 'typeorm';
import { Webhook } from 'svix';
import { Public } from './public.decorator';
import { ClerkService } from './clerk.service';
import { FundManager } from '../fund-managers/entities/fund-manager.entity';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserPayload {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  public_metadata?: Record<string, unknown> | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

@Controller('auth/webhook')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly clerk: ClerkService,
    @InjectRepository(FundManager)
    private readonly fundManagers: Repository<FundManager>,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTs: string,
    @Headers('svix-signature') svixSig: string,
  ): Promise<{ received: true; type: string }> {
    const secret = this.clerk.webhookSecret;
    if (!secret) {
      throw new ServiceUnavailableException('Clerk webhook secret not configured');
    }
    if (!svixId || !svixTs || !svixSig) {
      throw new BadRequestException('Missing svix signature headers');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Raw body not available');
    }

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(req.rawBody.toString('utf8'), {
        'svix-id': svixId,
        'svix-timestamp': svixTs,
        'svix-signature': svixSig,
      }) as ClerkWebhookEvent;
    } catch (err) {
      this.logger.warn(`Webhook signature invalid: ${(err as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      await this.upsertFundManager(event.data);
    } else {
      this.logger.debug(`Ignoring Clerk event: ${event.type}`);
    }

    return { received: true, type: event.type };
  }

  private async upsertFundManager(user: ClerkUserPayload): Promise<void> {
    const email =
      user.email_addresses?.find((e) => e.id === user.primary_email_address_id)?.email_address ??
      user.email_addresses?.[0]?.email_address;

    if (!email) {
      this.logger.warn(`Clerk user ${user.id} has no email; skipping upsert`);
      return;
    }

    const company =
      (user.public_metadata?.companyName as string | undefined) ?? 'Unspecified company';

    const existing = await this.fundManagers.findOne({ where: { clerkUserId: user.id } });
    if (existing) {
      existing.firstName = user.first_name ?? existing.firstName;
      existing.lastName = user.last_name ?? existing.lastName;
      existing.email = email;
      if (user.public_metadata?.companyName) {
        existing.companyName = company;
      }
      await this.fundManagers.save(existing);
      return;
    }

    await this.fundManagers.save(
      this.fundManagers.create({
        clerkUserId: user.id,
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        email,
        companyName: company,
      }),
    );
  }
}
