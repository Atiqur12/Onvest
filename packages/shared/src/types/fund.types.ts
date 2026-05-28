export enum FundType {
  PE = 'PE',
  VC = 'VC',
  REAL_ESTATE = 'REAL_ESTATE',
  HEDGE_FUND = 'HEDGE_FUND',
  OTHER = 'OTHER',
}

export enum FundJurisdiction {
  FR = 'FR',
  LU = 'LU',
  UK = 'UK',
  OTHER = 'OTHER',
}

export interface Fund {
  id: string;
  fundManagerId: string;
  name: string;
  type: FundType;
  jurisdiction: FundJurisdiction;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export interface OnboardingCampaign {
  id: string;
  fundId: string;
  name: string;
  status: CampaignStatus;
  inviteToken: string;
  requiredDocuments: string[];
  createdAt: string;
  updatedAt: string;
}
