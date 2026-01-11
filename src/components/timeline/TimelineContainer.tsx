import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTimelineStore } from '@/store/useTimelineStore';
import { getTimeline, getStats } from '@/lib/api';
import { StatsHeader } from './StatsHeader';
import { FiltersPanel } from './FiltersPanel';
import { TimelineFeed } from './TimelineFeed';
import { AssetHistoryModal } from './AssetHistoryModal';
import { format } from 'date-fns';
import { Shield, RefreshCw, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineContainerProps {
  domain?: string;
}

export function TimelineContainer({ domain: propDomain }: TimelineContainerProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(propDomain || '');
  const {
    domain: storeDomain,
    setDomain,
    selectedSeverity,
    selectedAssetType,
    dateRange,
    isFiltersPanelOpen,
    toggleFiltersPanel,
    resetFilters,
  } = useTimelineStore();

  const domain = propDomain || storeDomain;

  useEffect(() => {
    if (propDomain && propDomain !== storeDomain) {
      setDomain(propDomain);
      resetFilters();
    }
  }, [propDomain, storeDomain, setDomain, resetFilters]);

  const { 
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats', domain],
    queryFn: () => getStats(domain),
    enabled: !!domain,
  });

  const { 
    data: timelineData,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ['timeline', domain, selectedSeverity, selectedAssetType, dateRange],
    queryFn: () => getTimeline(domain, {
      severity: selectedSeverity || undefined,
      asset_type: selectedAssetType || undefined,
      from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    }),
    enabled: !!domain,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchTimeline();
  };

  const isLoading = isTimelineLoading || isStatsLoading;

  return (
    <div className="flex h-screen bg-background">
      <FiltersPanel />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isFiltersPanelOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFiltersPanel}
                  className="shrink-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <Shield className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (inputValue.trim()) {
                    navigate(`/timeline/${inputValue.trim()}`);
                  }
                }}>
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search domain..."
                    className="w-full max-w-sm bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground font-mono">{domain ? `Viewing history for ${domain}` : 'Enter a domain to begin'}</p>
                </form>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </header>

        <StatsHeader stats={stats || null} isLoading={isStatsLoading} />

        <main className="flex-1 overflow-y-auto p-4">
          <TimelineFeed 
            events={timelineData?.events || []} 
            isLoading={isTimelineLoading} 
            error={timelineError ? (timelineError as Error).message : null}
          />
        </main>
      </div>
      <AssetHistoryModal />
    </div>
  );
}
