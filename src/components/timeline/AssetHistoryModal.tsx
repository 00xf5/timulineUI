import { useQuery } from '@tanstack/react-query';
import { getAssetHistory } from '@/lib/api';
import { useTimelineStore } from '@/store/useTimelineStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { AssetTypeBadge } from './AssetTypeBadge';
import { SeverityBadge } from './SeverityBadge';
import { DiffViewer } from './DiffViewer';

export function AssetHistoryModal() {
  const { 
    isAssetHistoryModalOpen, 
    assetHistoryDomain, 
    assetHistoryPath, 
    closeAssetHistoryModal 
  } = useTimelineStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assetHistory', assetHistoryDomain, assetHistoryPath],
    queryFn: () => getAssetHistory(assetHistoryDomain!, assetHistoryPath!),
    enabled: !!assetHistoryDomain && !!assetHistoryPath,
  });

  if (!assetHistoryDomain || !assetHistoryPath) return null;

  return (
    <Dialog open={isAssetHistoryModalOpen} onOpenChange={closeAssetHistoryModal}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Asset History: {assetHistoryPath}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading && <AssetHistorySkeleton />}
          {error && <p className="text-destructive p-4">Error loading history: {(error as Error).message}</p>}
          {data && (
            <div className="space-y-4 p-4">
              {/* Summary Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Changes</p>
                  <p className="text-2xl font-bold">{data.summary.total_changes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{data.summary.critical_changes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk</p>
                  <p className="text-2xl font-bold text-yellow-500">{data.summary.risk_changes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Range</p>
                  <p className="text-sm font-semibold">{data.summary.time_range_days} days</p>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-4">
                {data.history.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={event.severity} />
                        <AssetTypeBadge type={event.asset_type} />
                        <span className="text-sm font-medium">{event.summary}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), 'PPpp')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.impact}</p>
                    {event.diff && (
                      <div className="mt-2">
                        <DiffViewer before={event.diff.before} after={event.diff.after} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AssetHistorySkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
