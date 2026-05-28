import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Investor } from '../investors/entities/investor.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private _client: Resend | null = null;

  get isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY);
  }

  warnIfMissing(): void {
    if (!this.isConfigured) {
      this.logger.warn(
        'RESEND_API_KEY not set — email notifications will be logged but not sent',
      );
    }
  }

  private get client(): Resend {
    if (this._client) return this._client;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not configured');
    this._client = new Resend(apiKey);
    return this._client;
  }

  private get fromAddress(): string {
    return process.env.RESEND_FROM_EMAIL ?? 'Onvest <noreply@on-vest.com>';
  }

  private get webBaseUrl(): string {
    return process.env.WEB_APP_URL ?? 'http://localhost:3000';
  }

  async notifyInvestorSubmitted(params: {
    investor: Investor;
    fundManagerEmail: string;
    campaignName: string;
  }): Promise<void> {
    const { investor, fundManagerEmail, campaignName } = params;
    const subject = `New investor submission: ${investor.firstName} ${investor.lastName}`;
    const html = `
      <p>A new investor has submitted onboarding documents for the campaign <strong>${campaignName}</strong>.</p>
      <ul>
        <li>Name: ${investor.firstName} ${investor.lastName}</li>
        <li>Email: ${investor.email}</li>
        <li>Type: ${investor.investorType}</li>
      </ul>
      <p><a href="${this.webBaseUrl}/investors/${investor.id}">Review submission</a></p>
    `;
    await this.send(fundManagerEmail, subject, html);
  }

  async notifyInvestorApproved(investor: Investor): Promise<void> {
    const subject = 'Your onboarding has been approved';
    const html = `
      <p>Hi ${investor.firstName},</p>
      <p>Your onboarding submission has been approved. The fund manager will be in touch with next steps shortly.</p>
      <p>Reference: ${investor.id}</p>
    `;
    await this.send(investor.email, subject, html);
  }

  async notifyInvestorRejected(investor: Investor): Promise<void> {
    const subject = 'Action required on your onboarding';
    const html = `
      <p>Hi ${investor.firstName},</p>
      <p>Your onboarding submission requires action.</p>
      <p><strong>Reason:</strong> ${investor.rejectionReason ?? 'Not specified'}</p>
      <p>Please contact the fund manager for next steps.</p>
      <p>Reference: ${investor.id}</p>
    `;
    await this.send(investor.email, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.log(`[email skipped — no RESEND_API_KEY] to=${to} subject=${subject}`);
      return;
    }
    try {
      const result = await this.client.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      if (result.error) {
        this.logger.error(`Resend send failed: ${result.error.message}`);
        return;
      }
      this.logger.log(`Email sent id=${result.data?.id} to=${to}`);
    } catch (err) {
      this.logger.error(`Resend exception: ${(err as Error).message}`);
    }
  }
}
