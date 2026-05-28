import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CampaignStatus } from '@onvest/shared';
import { Fund } from '../../funds/entities/fund.entity';
import { Investor } from '../../investors/entities/investor.entity';

@Entity({ name: 'onboarding_campaigns' })
export class OnboardingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'fund_id', type: 'char', length: 36 })
  fundId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status!: CampaignStatus;

  @Index({ unique: true })
  @Column({ name: 'invite_token', type: 'varchar', length: 64 })
  inviteToken!: string;

  @Column({ name: 'required_documents', type: 'json' })
  requiredDocuments!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => Fund, (f) => f.campaigns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fund_id' })
  fund!: Fund;

  @OneToMany(() => Investor, (i) => i.campaign)
  investors!: Investor[];
}
