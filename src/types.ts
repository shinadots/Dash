export interface PerformanceMetric {
  id: string;
  platform: 'meta' | 'google';
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  date: string;
  updatedAt: string;
  uid: string;
}

export interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  type: 'Ads' | 'Analytics' | 'Search Console';
  uid: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
