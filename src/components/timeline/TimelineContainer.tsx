import { useEffect, useState, useMemo } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { getTimeline, getStats } from '@/lib/api';
import type { TimelineEvent, DriftStatsResponse } from '@/lib/types';
import { StatsHeader } from './StatsHeader';
import { FiltersPanel } from './FiltersPanel';
import { TimelineFeed } from './TimelineFeed';
import { format } from 'date-fns';
import { Shield, RefreshCw, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demo purposes when API is unavailable
const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: 'critical',
    type: 'secret_detected',
    asset_type: 'secret',
    summary: 'AWS Access Key exposed in JavaScript bundle',
    path: '/static/js/main.chunk.js',
    impact: 'Exposed AWS credentials could allow unauthorized access to cloud resources, data exfiltration, and potential account takeover.',
    confidence: 0.95,
    security_implication: 'Immediate rotation of AWS keys recommended. Check CloudTrail for unauthorized usage.',
    diff: {
      before: null,
      after: 'const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";\nconst AWS_SECRET = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";'
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: 'risk',
    type: 'endpoint_added',
    asset_type: 'api',
    summary: 'New unauthenticated API endpoint detected',
    path: '/api/v1/admin/users',
    impact: 'New admin endpoint lacks authentication middleware. Could expose sensitive user data to unauthorized parties.',
    confidence: 0.82,
    security_implication: 'Verify authentication requirements. Consider adding rate limiting and access controls.',
    diff: {
      before: null,
      after: 'GET /api/v1/admin/users\nResponse: { users: [...], total: 1523 }'
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    severity: 'risk',
    type: 'asset_modified',
    asset_type: 'js',
    summary: 'Content Security Policy header removed',
    path: '/static/js/security.js',
    impact: 'Removal of CSP headers increases XSS attack surface and potential for code injection.',
    confidence: 0.88,
    diff: {
      before: 'helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["\'self\'"],\n    scriptSrc: ["\'self\'", "\'unsafe-inline\'"]\n  }\n})',
      after: '// CSP temporarily disabled\n// helmet.contentSecurityPolicy({...})'
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    severity: 'noise',
    type: 'asset_modified',
    asset_type: 'js',
    summary: 'Minor version bump in analytics script',
    path: '/static/js/analytics.min.js',
    impact: 'Third-party script updated to newer version. Review changelog for security implications.',
    confidence: 0.45,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    severity: 'critical',
    type: 'service_change',
    asset_type: 'infrastructure',
    summary: 'Database connection string exposed in client bundle',
    path: '/static/js/config.js',
    impact: 'Production database credentials visible in client-side code. Immediate action required to prevent data breach.',
    confidence: 0.98,
    security_implication: 'Rotate database credentials immediately. Audit database access logs for unauthorized queries.',
    diff: {
      before: 'const DB_URL = process.env.DATABASE_URL;',
      after: 'const DB_URL = "postgresql://admin:P@ssw0rd123@prod-db.example.com:5432/maindb";'
    }
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    severity: 'risk',
    type: 'endpoint_modified',
    asset_type: 'api',
    summary: 'Rate limiting disabled on authentication endpoint',
    path: '/api/auth/login',
    impact: 'Authentication endpoint now vulnerable to brute force attacks without rate limiting protection.',
    confidence: 0.76,
    diff: {
      before: 'app.use("/api/auth/login", rateLimiter({ max: 5, windowMs: 60000 }))',
      after: 'app.use("/api/auth/login", (req, res, next) => next())'
    }
  },
];

const mockStats: DriftStatsResponse = {
  total_drifts: 47,
  critical_count: 8,
  risk_count: 23,
  time_range_days: 30,
  by_asset_type: {
    js: 18,
    api: 15,
    infrastructure: 6,
    service: 5,
    secret: 3,
  },
  most_changed_assets: [],
};

interface TimelineContainerProps {
  domain?: string;
}

export function TimelineContainer({ domain: propDomain }: TimelineContainerProps) {
  const { 
    domain: storeDomain, 
    setDomain,
    selectedSeverity, 
    selectedAssetType,
    dateRange,
    isFiltersPanelOpen,
    toggleFiltersPanel,
  } = useTimelineStore();
  
  const domain = propDomain || storeDomain;

  const [events, setEvents] = useState<TimelineEvent[]>(mockEvents);
  const [stats, setStats] = useState<DriftStatsResponse | null>(mockStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from real API (with fallback to mock)
  const fetchData = async () => {
    setIsLoading(true);
    setIsStatsLoading(true);
    setError(null);

    try {
      const [timelineRes, statsRes] = await Promise.all([
        getTimeline(domain, {
          severity: selectedSeverity || undefined,
          asset_type: selectedAssetType || undefined,
          from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        }),
        getStats(domain),
      ]);

      setEvents(timelineRes.events);
      setStats(statsRes);
    } catch (err) {
      // Fallback to mock data for demo
      console.log('API unavailable, using demo data');
      setEvents(mockEvents);
      setStats(mockStats);
    } finally {
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [domain]);

  // Update domain from prop
  useEffect(() => {
    if (propDomain && propDomain !== storeDomain) {
      setDomain(propDomain);
    }
  }, [propDomain, storeDomain, setDomain]);

  // Filter events client-side for immediate feedback
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedSeverity && event.severity !== selectedSeverity) return false;
      if (selectedAssetType && event.asset_type !== selectedAssetType) return false;
      return true;
    });
  }, [events, selectedSeverity, selectedAssetType]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Filters sidebar */}
      <FiltersPanel />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
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
              <div>
                <h1 className="text-lg font-semibold text-foreground">RiskSignal Timeline</h1>
                <p className="text-xs text-muted-foreground font-mono">{domain}</p>
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
        <StatsHeader stats={stats} isLoading={isStatsLoading} />

        {/* Timeline */}
        <main className="flex-1 overflow-y-auto p-4">
          <TimelineFeed 
            events={filteredEvents} 
            isLoading={isLoading} 
            error={error}
          />
        </main>
      </div>
    </div>
  );
}
