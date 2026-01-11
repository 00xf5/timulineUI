import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getTimeline, getGlobalStats } from '@/lib/api';
import { TimelineFeed } from '@/components/timeline/TimelineFeed';
import { GlobalStatsHeader } from '@/components/timeline/GlobalStatsHeader';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { 
    data: timelineData, 
    isLoading: isTimelineLoading, 
    error,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ['globalTimeline'],
    queryFn: () => getTimeline(), // No domain provided to fetch all events
  });

  const { 
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['globalStats'],
    queryFn: () => getGlobalStats(),
  });

  const handleRefresh = () => {
    refetchTimeline();
    refetchStats();
  };

  const isLoading = isTimelineLoading || isStatsLoading;

  return (
    <>
      <Helmet>
        <title>Global Dashboard | RiskSignal Timeline</title>
        <meta name="description" content="View real-time security drift events from all monitored domains. Get a comprehensive overview of your attack surface changes." />
        <link rel="canonical" href="https://app.risksignal.com/dashboard" />
        <meta property="og:title" content="Global Dashboard | RiskSignal Timeline" />
        <meta property="og:description" content="View real-time security drift events from all monitored domains." />
        <meta property="og:url" content="https://app.risksignal.com/dashboard" />
        <meta property="og:image" content="https://app.risksignal.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RiskSignal" />
        <meta name="twitter:image" content="https://app.risksignal.com/og-image.png" />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="shrink-0 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Global RiskSignal Timeline</h1>
                <p className="text-xs text-muted-foreground">Real-time events from all monitored domains</p>
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

        {/* Stats */}
        <GlobalStatsHeader stats={stats || null} isLoading={isStatsLoading} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <TimelineFeed 
            events={timelineData?.events || []} 
            isLoading={isTimelineLoading} 
            error={error ? (error as Error).message : null}
          />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
