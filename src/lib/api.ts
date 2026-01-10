// RiskSignal Timeline - API Integration Layer
// Connects to the Drift Engine at drift-whvl.onrender.com

import type { 
  TimelineResponse, 
  DriftStatsResponse, 
  AssetHistoryResponse,
  Severity,
  AssetType 
} from './types';

const BASE_URL = 'https://drift-whvl.onrender.com';

async function fetchInternal<T>(
  endpoint: string, 
  params: Record<string, any> = {}
): Promise<T> {
  // Clean params (remove undefined/null)
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- API Methods ---

export interface TimelineFiltersParams {
  severity?: Severity;
  asset_type?: AssetType;
  from?: string;
  to?: string;
  cursor?: string;
}

export const getTimeline = (domain: string, filters: TimelineFiltersParams = {}) => 
  fetchInternal<TimelineResponse>('/api/drift/timeline', { domain, ...filters });

export const getStats = (domain: string, days: number = 30) => 
  fetchInternal<DriftStatsResponse>('/api/drift/stats', { domain, days });

export const getAssetHistory = (domain: string, path: string, days: number = 30) =>
  fetchInternal<AssetHistoryResponse>('/api/drift/asset-history', { domain, path, days });

// Health check
export const checkHealth = () => 
  fetchInternal<{ status: string }>('/health');
