export enum DocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  BANK_STATEMENT = 'BANK_STATEMENT',
  COMPANY_REGISTRATION = 'COMPANY_REGISTRATION',
  UBO_DECLARATION = 'UBO_DECLARATION',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  AI_PROCESSING = 'AI_PROCESSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface AiDocumentAnalysis {
  detected_type: DocumentType;
  confidence: number;
  is_expired: boolean;
  expiry_date: string | null;
  flags: string[];
  summary: string;
}

export interface DocumentRecord {
  id: string;
  investorId: string;
  documentType: DocumentType;
  originalFileName: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  aiClassification: string | null;
  aiConfidence: number | null;
  aiFlags: string[] | null;
  isExpired: boolean;
  status: DocumentStatus;
  uploadedAt: string;
  createdAt: string;
}
