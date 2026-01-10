import { cn } from '@/lib/utils';
import type { DriftStatsResponse } from '@/lib/types';
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp,
  Code2,
  Globe,
  Server,
  KeyRound
} from 'lucide-react';

interface StatsHeaderProps {
  stats: DriftStatsResponse | null;
  isLoading: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: typeof Activity;
  variant?: 'default' | 'critical' | 'risk';
}

function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-lg border p-4 transition-colors',
      variant === 'default' && 'bg-card border-border',
      variant === 'critical' && 'bg-critical-muted border-critical/20',
      variant === 'risk' && 'bg-risk-muted border-risk/20',
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn(
          'h-4 w-4',
          variant === 'default' && 'text-muted-foreground',
          variant === 'critical' && 'text-critical',
          variant === 'risk' && 'text-risk',
        )} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
      </div>
      <div className={cn(
        'text-2xl font-bold tabular-nums',
        variant === 'default' && 'text-foreground',
        variant === 'critical' && 'text-critical',
        variant === 'risk' && 'text-risk',
      )}>
        {value}
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-pulse">
      <div className="h-4 w-20 bg-secondary rounded mb-2" />
      <div className="h-8 w-12 bg-secondary rounded" />
    </div>
  );
}

export function StatsHeader({ stats, isLoading }: StatsHeaderProps) {
  if (isLoading) {
    return (
      <div className="border-b border-border bg-card/50 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="border-b border-border bg-card/50 p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Drifts" 
          value={stats.total_drifts} 
          icon={Activity}
        />
        <StatCard 
          label="Critical" 
          value={stats.critical_count} 
          icon={AlertCircle}
          variant="critical"
        />
        <StatCard 
          label="At Risk" 
          value={stats.risk_count} 
          icon={AlertTriangle}
          variant="risk"
        />
        <StatCard 
          label={`${stats.time_range_days}d Range`}
          value={`${stats.by_asset_type.js + stats.by_asset_type.api} Assets`}
          icon={TrendingUp}
        />
      </div>

      {/* Asset breakdown mini-bar */}
      {stats.total_drifts > 0 && (
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium">By Type:</span>
          <div className="flex items-center gap-3">
            {stats.by_asset_type.js > 0 && (
              <span className="flex items-center gap-1">
                <Code2 className="h-3 w-3 text-yellow-400" />
                {stats.by_asset_type.js} JS
              </span>
            )}
            {stats.by_asset_type.api > 0 && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-blue-400" />
                {stats.by_asset_type.api} API
              </span>
            )}
            {stats.by_asset_type.infrastructure > 0 && (
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3 text-purple-400" />
                {stats.by_asset_type.infrastructure} Infra
              </span>
            )}
            {stats.by_asset_type.secret > 0 && (
              <span className="flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-critical" />
                {stats.by_asset_type.secret} Secrets
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
