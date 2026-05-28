export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  TRUST = 'TRUST',
  FUND = 'FUND',
}

export enum InvestorStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface UboDetail {
  fullName: string;
  ownershipPercent: number;
  nationality: string;
  dateOfBirth?: string;
}

export interface Investor {
  id: string;
  campaignId: string;
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  investorType: InvestorType;
  entityName: string | null;
  uboDetails: UboDetail[] | null;
  status: InvestorStatus;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
