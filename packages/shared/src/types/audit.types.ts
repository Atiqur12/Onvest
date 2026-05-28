export enum AuditEntityType {
  INVESTOR = 'INVESTOR',
  DOCUMENT = 'DOCUMENT',
  CAMPAIGN = 'CAMPAIGN',
  FUND = 'FUND',
}

export enum AuditAction {
  CREATED = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_ACCEPTED = 'DOCUMENT_ACCEPTED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  AI_PROCESSED = 'AI_PROCESSED',
}

export interface AuditLogEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  previousValue: unknown | null;
  newValue: unknown | null;
  ipAddress: string | null;
  createdAt: string;
}
