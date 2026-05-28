import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Fund } from '../../funds/entities/fund.entity';

@Entity({ name: 'fund_managers' })
export class FundManager {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'clerk_user_id', type: 'varchar', length: 191 })
  clerkUserId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 191 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 191 })
  lastName!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ name: 'company_name', type: 'varchar', length: 191 })
  companyName!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => Fund, (fund) => fund.fundManager)
  funds!: Fund[];
}
