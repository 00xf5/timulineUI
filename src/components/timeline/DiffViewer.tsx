import { cn } from '@/lib/utils';
import { Minus, Plus, FileCode } from 'lucide-react';

interface DiffViewerProps {
  before: any | null;
  after: any | null;
  className?: string;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function DiffLine({ 
  content, 
  type 
}: { 
  content: string; 
  type: 'add' | 'remove' | 'neutral';
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-0.5 font-mono text-xs leading-relaxed',
        type === 'add' && 'bg-diff-add text-diff-add-text',
        type === 'remove' && 'bg-diff-remove text-diff-remove-text',
        type === 'neutral' && 'text-muted-foreground'
      )}
    >
      <span className="w-4 shrink-0 select-none opacity-60">
        {type === 'add' && <Plus className="h-3 w-3" />}
        {type === 'remove' && <Minus className="h-3 w-3" />}
      </span>
      <pre className="whitespace-pre-wrap break-all">{content}</pre>
    </div>
  );
}

export function DiffViewer({ before, after, className }: DiffViewerProps) {
  const beforeStr = formatValue(before);
  const afterStr = formatValue(after);
  
  const beforeLines = beforeStr.split('\n').filter(Boolean);
  const afterLines = afterStr.split('\n').filter(Boolean);

  // New asset (no before)
  if (!before && after) {
    return (
      <div className={cn('rounded-md border border-stable/20 overflow-hidden', className)}>
        <div className="flex items-center gap-2 bg-stable-muted px-3 py-2 border-b border-stable/20">
          <FileCode className="h-4 w-4 text-stable" />
          <span className="text-xs font-medium text-stable">New Asset Added</span>
        </div>
        <div className="max-h-64 overflow-auto bg-card">
          {afterLines.map((line, i) => (
            <DiffLine key={i} content={line} type="add" />
          ))}
        </div>
      </div>
    );
  }

  // Deleted asset (no after)
  if (before && !after) {
    return (
      <div className={cn('rounded-md border border-critical/20 overflow-hidden', className)}>
        <div className="flex items-center gap-2 bg-critical-muted px-3 py-2 border-b border-critical/20">
          <FileCode className="h-4 w-4 text-critical" />
          <span className="text-xs font-medium text-critical">Asset Removed</span>
        </div>
        <div className="max-h-64 overflow-auto bg-card">
          {beforeLines.map((line, i) => (
            <DiffLine key={i} content={line} type="remove" />
          ))}
        </div>
      </div>
    );
  }

  // Modified asset (both before and after)
  if (before && after) {
    return (
      <div className={cn('rounded-md border border-border overflow-hidden', className)}>
        <div className="flex items-center gap-2 bg-secondary px-3 py-2 border-b border-border">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Changes Detected</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Before */}
          <div className="max-h-64 overflow-auto bg-card">
            <div className="sticky top-0 bg-critical-muted/50 px-3 py-1 border-b border-border">
              <span className="text-[10px] uppercase tracking-wide text-critical">Before</span>
            </div>
            {beforeLines.map((line, i) => (
              <DiffLine key={i} content={line} type="remove" />
            ))}
          </div>
          {/* After */}
          <div className="max-h-64 overflow-auto bg-card">
            <div className="sticky top-0 bg-stable-muted/50 px-3 py-1 border-b border-border">
              <span className="text-[10px] uppercase tracking-wide text-stable">After</span>
            </div>
            {afterLines.map((line, i) => (
              <DiffLine key={i} content={line} type="add" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No diff available
  return (
    <div className={cn('rounded-md border border-border bg-card p-4', className)}>
      <p className="text-xs text-muted-foreground text-center">No diff data available</p>
    </div>
  );
}
