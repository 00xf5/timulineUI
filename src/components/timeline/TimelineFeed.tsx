import { motion } from 'framer-motion';
import type { TimelineEvent } from '@/lib/types';
import { DriftEventNode } from './DriftEventNode';
import { useTimelineStore } from '@/store/useTimelineStore';
import { Loader2, ShieldOff } from 'lucide-react';

interface TimelineFeedProps {
  events: TimelineEvent[];
  isLoading: boolean;
  error?: string | null;
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <ShieldOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No drift events found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        No security changes detected for the current filters. Try adjusting your filter criteria or check back later.
      </p>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative pl-10">
          <div className="absolute left-2 top-2">
            <div className="h-7 w-7 rounded-full bg-secondary" />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-4 w-4 rounded bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-secondary rounded" />
                <div className="h-5 w-3/4 bg-secondary rounded" />
                <div className="h-3 w-1/2 bg-secondary rounded" />
              </div>
              <div className="h-4 w-20 bg-secondary rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function TimelineFeed({ events, isLoading, error }: TimelineFeedProps) {
  const { expandedEventId, toggleEvent } = useTimelineStore();

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="h-16 w-16 rounded-full bg-critical-muted flex items-center justify-center mb-4">
          <ShieldOff className="h-8 w-8 text-critical" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load timeline</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </motion.div>
    );
  }

  if (isLoading && events.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!isLoading && events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <DriftEventNode
            event={event}
            isExpanded={expandedEventId === event.id}
            onToggle={() => toggleEvent(event.id)}
            isLast={index === events.length - 1}
          />
        </motion.div>
      ))}
      
      {isLoading && events.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
