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
import { FundJurisdiction, FundType } from '@onvest/shared';
import { FundManager } from '../../fund-managers/entities/fund-manager.entity';
import { OnboardingCampaign } from '../../campaigns/entities/onboarding-campaign.entity';

@Entity({ name: 'funds' })
export class Fund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'fund_manager_id', type: 'char', length: 36 })
  fundManagerId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: FundType })
  type!: FundType;

  @Column({ type: 'enum', enum: FundJurisdiction })
  jurisdiction!: FundJurisdiction;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => FundManager, (fm) => fm.funds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fund_manager_id' })
  fundManager!: FundManager;

  @OneToMany(() => OnboardingCampaign, (c) => c.fund)
  campaigns!: OnboardingCampaign[];
}
