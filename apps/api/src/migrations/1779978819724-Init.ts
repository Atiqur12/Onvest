import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779978819724 implements MigrationInterface {
    name = 'Init1779978819724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`documents\` (\`id\` varchar(36) NOT NULL, \`investor_id\` varchar(36) NOT NULL, \`document_type\` enum ('PASSPORT', 'NATIONAL_ID', 'PROOF_OF_ADDRESS', 'BANK_STATEMENT', 'COMPANY_REGISTRATION', 'UBO_DECLARATION', 'OTHER') NOT NULL, \`original_file_name\` varchar(512) NOT NULL, \`s3_key\` varchar(1024) NOT NULL, \`file_size\` int NOT NULL, \`mime_type\` varchar(191) NOT NULL, \`ai_classification\` varchar(64) NULL, \`ai_confidence\` float NULL, \`ai_flags\` json NULL, \`is_expired\` tinyint NOT NULL DEFAULT 0, \`status\` enum ('PENDING', 'AI_PROCESSING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING', \`uploaded_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_dd730a3c4e792e60e10f07b5a9\` (\`investor_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`investors\` (\`id\` varchar(36) NOT NULL, \`campaign_id\` varchar(36) NOT NULL, \`first_name\` varchar(191) NOT NULL, \`last_name\` varchar(191) NOT NULL, \`email\` varchar(191) NOT NULL, \`nationality\` varchar(64) NOT NULL, \`investor_type\` enum ('INDIVIDUAL', 'CORPORATE', 'TRUST', 'FUND') NOT NULL, \`entity_name\` varchar(255) NULL, \`ubo_details\` json NULL, \`status\` enum ('PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING', \`rejection_reason\` text NULL, \`submitted_at\` timestamp NULL, \`reviewed_at\` timestamp NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_21d8c5394ff8231fd5ce8f6925\` (\`campaign_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`onboarding_campaigns\` (\`id\` varchar(36) NOT NULL, \`fund_id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`status\` enum ('DRAFT', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'DRAFT', \`invite_token\` varchar(64) NOT NULL, \`required_documents\` json NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_4c1c9909f346a137910ff22544\` (\`fund_id\`), UNIQUE INDEX \`IDX_aaea0737176d0a9baf1b027a79\` (\`invite_token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`funds\` (\`id\` varchar(36) NOT NULL, \`fund_manager_id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('PE', 'VC', 'REAL_ESTATE', 'HEDGE_FUND', 'OTHER') NOT NULL, \`jurisdiction\` enum ('FR', 'LU', 'UK', 'OTHER') NOT NULL, \`description\` text NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_b0ef9ff8158c10246f732cdff7\` (\`fund_manager_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fund_managers\` (\`id\` varchar(36) NOT NULL, \`clerk_user_id\` varchar(191) NOT NULL, \`first_name\` varchar(191) NOT NULL, \`last_name\` varchar(191) NOT NULL, \`email\` varchar(191) NOT NULL, \`company_name\` varchar(191) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e9b946614040d7267d7525b557\` (\`clerk_user_id\`), UNIQUE INDEX \`IDX_345f9ef98c7e031ab90a1a851f\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`entity_type\` enum ('INVESTOR', 'DOCUMENT', 'CAMPAIGN', 'FUND') NOT NULL, \`entity_id\` char(36) NOT NULL, \`action\` enum ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_ACCEPTED', 'DOCUMENT_REJECTED', 'STATUS_CHANGED', 'AI_PROCESSED') NOT NULL, \`performed_by\` varchar(191) NOT NULL, \`previous_value\` json NULL, \`new_value\` json NULL, \`ip_address\` varchar(64) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_7421efc125d95e413657efa3c6\` (\`entity_type\`, \`entity_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`documents\` ADD CONSTRAINT \`FK_dd730a3c4e792e60e10f07b5a9d\` FOREIGN KEY (\`investor_id\`) REFERENCES \`investors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`investors\` ADD CONSTRAINT \`FK_21d8c5394ff8231fd5ce8f69251\` FOREIGN KEY (\`campaign_id\`) REFERENCES \`onboarding_campaigns\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`onboarding_campaigns\` ADD CONSTRAINT \`FK_4c1c9909f346a137910ff22544f\` FOREIGN KEY (\`fund_id\`) REFERENCES \`funds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`funds\` ADD CONSTRAINT \`FK_b0ef9ff8158c10246f732cdff7f\` FOREIGN KEY (\`fund_manager_id\`) REFERENCES \`fund_managers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`funds\` DROP FOREIGN KEY \`FK_b0ef9ff8158c10246f732cdff7f\``);
        await queryRunner.query(`ALTER TABLE \`onboarding_campaigns\` DROP FOREIGN KEY \`FK_4c1c9909f346a137910ff22544f\``);
        await queryRunner.query(`ALTER TABLE \`investors\` DROP FOREIGN KEY \`FK_21d8c5394ff8231fd5ce8f69251\``);
        await queryRunner.query(`ALTER TABLE \`documents\` DROP FOREIGN KEY \`FK_dd730a3c4e792e60e10f07b5a9d\``);
        await queryRunner.query(`DROP INDEX \`IDX_7421efc125d95e413657efa3c6\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_345f9ef98c7e031ab90a1a851f\` ON \`fund_managers\``);
        await queryRunner.query(`DROP INDEX \`IDX_e9b946614040d7267d7525b557\` ON \`fund_managers\``);
        await queryRunner.query(`DROP TABLE \`fund_managers\``);
        await queryRunner.query(`DROP INDEX \`IDX_b0ef9ff8158c10246f732cdff7\` ON \`funds\``);
        await queryRunner.query(`DROP TABLE \`funds\``);
        await queryRunner.query(`DROP INDEX \`IDX_aaea0737176d0a9baf1b027a79\` ON \`onboarding_campaigns\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c1c9909f346a137910ff22544\` ON \`onboarding_campaigns\``);
        await queryRunner.query(`DROP TABLE \`onboarding_campaigns\``);
        await queryRunner.query(`DROP INDEX \`IDX_21d8c5394ff8231fd5ce8f6925\` ON \`investors\``);
        await queryRunner.query(`DROP TABLE \`investors\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd730a3c4e792e60e10f07b5a9\` ON \`documents\``);
        await queryRunner.query(`DROP TABLE \`documents\``);
    }

}
