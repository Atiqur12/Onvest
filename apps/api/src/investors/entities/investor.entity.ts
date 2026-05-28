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
import { InvestorStatus, InvestorType, UboDetail } from '@onvest/shared';
import { OnboardingCampaign } from '../../campaigns/entities/onboarding-campaign.entity';
import { DocumentEntity } from '../../documents/entities/document.entity';

@Entity({ name: 'investors' })
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'campaign_id', type: 'char', length: 36 })
  campaignId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 191 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 191 })
  lastName!: string;

  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ type: 'varchar', length: 64 })
  nationality!: string;

  @Column({ name: 'investor_type', type: 'enum', enum: InvestorType })
  investorType!: InvestorType;

  @Column({ name: 'entity_name', type: 'varchar', length: 255, nullable: true })
  entityName!: string | null;

  @Column({ name: 'ubo_details', type: 'json', nullable: true })
  uboDetails!: UboDetail[] | null;

  @Column({ type: 'enum', enum: InvestorStatus, default: InvestorStatus.PENDING })
  status!: InvestorStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt!: Date | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => OnboardingCampaign, (c) => c.investors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: OnboardingCampaign;

  @OneToMany(() => DocumentEntity, (d) => d.investor)
  documents!: DocumentEntity[];
}
