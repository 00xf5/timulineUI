import type { DriftStatsResponse } from '@/lib/types';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

interface GlobalStatsHeaderProps {
  stats: DriftStatsResponse | null;
  isLoading: boolean;
}

export function GlobalStatsHeader({ stats, isLoading }: GlobalStatsHeaderProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 animate-pulse">
        <div className="bg-card border rounded-lg p-4">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
        </div>
        <p className="text-2xl font-bold">{stats.total_drifts}</p>
        <p className="text-xs text-muted-foreground">Last {stats.time_range_days} days</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-muted-foreground">Critical & Risk</p>
        </div>
        <p className="text-2xl font-bold text-red-500">{stats.critical_count + stats.risk_count}</p>
        <p className="text-xs text-muted-foreground">{stats.critical_count} critical, {stats.risk_count} risk</p>
      </div>
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Top Asset Type</p>
        </div>
        <p className="text-2xl font-bold capitalize">
          {Object.entries(stats.by_asset_type).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
        </p>
        <p className="text-xs text-muted-foreground">
          {Object.entries(stats.by_asset_type).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} events
        </p>
      </div>
    </div>
  );
}
