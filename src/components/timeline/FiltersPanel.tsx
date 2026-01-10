import { cn } from '@/lib/utils';
import { useTimelineStore } from '@/store/useTimelineStore';
import type { Severity, AssetType } from '@/lib/types';
import { 
  Filter, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Circle,
  Code2,
  Globe,
  Server,
  Boxes,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const severityOptions: { value: Severity; label: string; icon: typeof AlertCircle }[] = [
  { value: 'critical', label: 'Critical', icon: AlertCircle },
  { value: 'risk', label: 'Risk', icon: AlertTriangle },
  { value: 'noise', label: 'Noise', icon: Circle },
];

const assetTypeOptions: { value: AssetType; label: string; icon: typeof Code2 }[] = [
  { value: 'js', label: 'JavaScript', icon: Code2 },
  { value: 'api', label: 'API', icon: Globe },
  { value: 'infrastructure', label: 'Infrastructure', icon: Server },
  { value: 'service', label: 'Service', icon: Boxes },
  { value: 'secret', label: 'Secrets', icon: KeyRound },
];

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  severity?: Severity;
}

function FilterButton({ active, onClick, children, severity }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all w-full text-left',
        'hover:bg-accent',
        active && 'bg-accent',
        active && severity === 'critical' && 'bg-critical-muted text-critical',
        active && severity === 'risk' && 'bg-risk-muted text-risk',
        active && severity === 'noise' && 'bg-noise-muted text-noise',
        !active && 'text-muted-foreground',
      )}
    >
      {children}
    </button>
  );
}

export function FiltersPanel() {
  const { 
    selectedSeverity, 
    selectedAssetType,
    setSeverity, 
    setAssetType,
    resetFilters,
    isFiltersPanelOpen,
    toggleFiltersPanel,
  } = useTimelineStore();

  const hasActiveFilters = selectedSeverity !== null || selectedAssetType !== null;

  if (!isFiltersPanelOpen) {
    return (
      <div className="fixed left-4 top-20 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFiltersPanel}
          className="bg-card border-border"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar h-full overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          </div>
          <button
            onClick={toggleFiltersPanel}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset all filters</span>
          </button>
        )}

        {/* Severity filters */}
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
            Severity
          </h3>
          <div className="space-y-1">
            {severityOptions.map(({ value, label, icon: Icon }) => (
              <FilterButton
                key={value}
                active={selectedSeverity === value}
                onClick={() => setSeverity(selectedSeverity === value ? null : value)}
                severity={value}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Asset Type filters */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
            Asset Type
          </h3>
          <div className="space-y-1">
            {assetTypeOptions.map(({ value, label, icon: Icon }) => (
              <FilterButton
                key={value}
                active={selectedAssetType === value}
                onClick={() => setAssetType(selectedAssetType === value ? null : value)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </FilterButton>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
