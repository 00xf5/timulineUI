// RiskSignal Timeline - Type Definitions
// Strict data types for the Drift Engine API

export type Severity = 'critical' | 'risk' | 'noise';

export type AssetType = 
  | 'js' 
  | 'api' 
  | 'infrastructure' 
  | 'service' 
  | 'secret' 
  | 'unknown';

export type ChangeType = 
  | 'asset_added' 
  | 'asset_modified' 
  | 'asset_removed' 
  | 'endpoint_added' 
  | 'endpoint_modified'
  | 'secret_detected'
  | 'service_change';

/**
 * Represents a single point in time change.
 * Returned by /api/drift/timeline and /api/drift/event/:id
 */
export interface TimelineEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  type: ChangeType;
  asset_type: AssetType;
  
  // Display
  summary: string;
  path: string;
  
  // Forensics
  impact: string;
  confidence: number;
  security_implication?: string;
  
  // Data for DiffViewer
  diff?: {
    before: any | null;
    after: any | null;
  };
  
  // Metadata associated with the event
  details?: Record<string, any>;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  next_cursor: string | null;
  total_returned: number;
}

export interface AssetChangeStats {
  path: string;
  count: number;
  last_change: string;
  severity: Severity;
  type: AssetType;
}

export interface DriftStatsResponse {
  total_drifts: number;
  critical_count: number;
  risk_count: number;
  time_range_days: number;
  
  by_asset_type: {
    js: number;
    api: number;
    infrastructure: number;
    service: number;
    secret: number;
  };

  most_changed_assets: AssetChangeStats[];
}

export interface AssetHistoryResponse {
  asset_path: string;
  time_range_days: number;
  summary: {
    total_changes: number;
    critical_changes: number;
    risk_changes: number;
    first_seen: string | null;
    last_seen: string | null;
    most_common_action: string | null;
  };
  history: TimelineEvent[];
}

// Filter state type
export interface TimelineFilters {
  severity: Severity | null;
  asset_type: AssetType | null;
  from: Date | null;
  to: Date | null;
}
