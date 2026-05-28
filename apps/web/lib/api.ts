import type {
  ApiResponse,
  CampaignStatus,
  DocumentRecord,
  Fund,
  Investor,
  InvestorStatus,
  OnboardingCampaign,
} from '@onvest/shared';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
const DEV_USER = process.env.NEXT_PUBLIC_DEV_USER_ID ?? 'user_fm_alpha';

type FetchOpts = { headers?: Record<string, string>; body?: unknown; method?: string };

async function call<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };
  if (DEV_BYPASS) headers['x-dev-user-id'] = DEV_USER;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = (json as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return (json as ApiResponse<T>).data;
}

export const api = {
  funds: {
    list: () => call<Fund[]>('/funds'),
    get: (id: string) => call<Fund>(`/funds/${id}`),
    create: (body: Partial<Fund>) => call<Fund>('/funds', { method: 'POST', body }),
  },
  campaigns: {
    list: (fundId?: string) =>
      call<OnboardingCampaign[]>(`/campaigns${fundId ? `?fundId=${fundId}` : ''}`),
    get: (id: string) =>
      call<OnboardingCampaign & { investors: Investor[] }>(`/campaigns/${id}`),
    create: (body: { fundId: string; name: string; requiredDocuments: string[] }) =>
      call<OnboardingCampaign>('/campaigns', { method: 'POST', body }),
    setStatus: (id: string, status: CampaignStatus) =>
      call<OnboardingCampaign>(`/campaigns/${id}/status`, { method: 'PATCH', body: { status } }),
    publicByToken: (token: string) =>
      call<{
        id: string;
        name: string;
        requiredDocuments: string[];
        fund: { id: string; name: string; type: string; jurisdiction: string };
      }>(`/campaigns/public/${token}`),
  },
  investors: {
    list: (filters: { status?: InvestorStatus; campaignId?: string } = {}) => {
      const q = new URLSearchParams();
      if (filters.status) q.set('status', filters.status);
      if (filters.campaignId) q.set('campaignId', filters.campaignId);
      const qs = q.toString();
      return call<Investor[]>(`/investors${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) =>
      call<Investor & { documents: DocumentRecord[] }>(`/investors/${id}`),
    approve: (id: string) =>
      call<Investor>(`/investors/${id}/approve`, { method: 'PATCH' }),
    reject: (id: string, reason: string) =>
      call<Investor>(`/investors/${id}/reject`, { method: 'PATCH', body: { reason } }),
    audit: (id: string) => call<unknown[]>(`/investors/${id}/audit`),
    submitPublic: (body: Record<string, unknown>) =>
      call<{ id: string; status: string }>('/investors/public', { method: 'POST', body }),
  },
  documents: {
    get: (id: string) => call<DocumentRecord>(`/documents/${id}`),
    accept: (id: string) =>
      call<DocumentRecord>(`/documents/${id}/accept`, { method: 'PATCH' }),
    reject: (id: string) =>
      call<DocumentRecord>(`/documents/${id}/reject`, { method: 'PATCH' }),
    downloadUrl: (id: string) =>
      call<{ url: string; expiresIn: number }>(`/documents/${id}/download-url`),
  },
};

export async function uploadDocument(args: {
  file: File;
  inviteToken: string;
  investorId: string;
  documentType: string;
}): Promise<{ id: string; status: string; originalFileName: string }> {
  const fd = new FormData();
  fd.append('file', args.file);
  fd.append('inviteToken', args.inviteToken);
  fd.append('investorId', args.investorId);
  fd.append('documentType', args.documentType);

  const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: fd });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return (json as ApiResponse<{ id: string; status: string; originalFileName: string }>).data;
}
