import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/lib/types';
import { SeverityBadge, SeverityDot } from './SeverityBadge';
import { AssetTypeBadge } from './AssetTypeBadge';
import { DiffViewer } from './DiffViewer';
import { 
  ChevronRight, 
  Clock, 
  FileCode, 
  Shield, 
  Gauge 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DriftEventNodeProps {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    asset_added: 'Added',
    asset_modified: 'Modified',
    asset_removed: 'Removed',
    endpoint_added: 'New Endpoint',
    endpoint_modified: 'Endpoint Changed',
    secret_detected: 'Secret Exposed',
    service_change: 'Service Change',
  };
  return labels[type] || type;
}

export function DriftEventNode({ 
  event, 
  isExpanded, 
  onToggle,
  isLast = false 
}: DriftEventNodeProps) {
  const timestamp = new Date(event.timestamp);
  
  return (
    <div className="relative pl-10">
      {/* Timeline spine */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-timeline-spine" />
      )}
      
      {/* Timeline node */}
      <div className="absolute left-2 top-2 flex items-center justify-center">
        <div className={cn(
          'h-7 w-7 rounded-full border-2 flex items-center justify-center',
          'bg-card transition-colors',
          event.severity === 'critical' && 'border-critical',
          event.severity === 'risk' && 'border-risk',
          event.severity === 'noise' && 'border-noise',
        )}>
          <SeverityDot severity={event.severity} size="sm" />
        </div>
      </div>

      {/* Event card */}
      <motion.div
        layout
        className={cn(
          'rounded-lg border transition-colors cursor-pointer',
          'bg-card hover:bg-accent/50',
          isExpanded ? 'border-primary/30' : 'border-border',
          event.severity === 'critical' && isExpanded && 'border-critical/30',
        )}
        onClick={onToggle}
      >
        {/* Collapsed header */}
        <div className="flex items-start gap-3 p-3">
          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="mt-0.5 shrink-0"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge severity={event.severity} size="sm" showLabel={false} />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                {getChangeTypeLabel(event.type)}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-foreground leading-tight mb-1">
              {event.summary}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono truncate max-w-[200px]" title={event.path}>
                {event.path}
              </span>
              <AssetTypeBadge type={event.asset_type} showLabel={false} />
            </div>
          </div>

          {/* Timestamp */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
            </div>
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
              {format(timestamp, 'MMM d, HH:mm')}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-t border-border px-4 py-4 space-y-4">
                {/* Impact statement */}
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-risk shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                      Security Impact
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.impact}
                    </p>
                  </div>
                </div>

                {/* Security implication if available */}
                {event.security_implication && (
                  <div className="flex items-start gap-3">
                    <FileCode className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">
                        Details
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.security_implication}
                      </p>
                    </div>
                  </div>
                )}

                {/* Confidence score */}
                <div className="flex items-center gap-3">
                  <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            event.confidence >= 0.8 && 'bg-stable',
                            event.confidence >= 0.5 && event.confidence < 0.8 && 'bg-risk',
                            event.confidence < 0.5 && 'bg-noise',
                          )}
                          style={{ width: `${event.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {Math.round(event.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diff viewer */}
                {event.diff && (
                  <div className="pt-2">
                    <DiffViewer 
                      before={event.diff.before} 
                      after={event.diff.after} 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
