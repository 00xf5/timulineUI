import { cn } from '@/lib/utils';
import type { AssetType } from '@/lib/types';
import { 
  Code2, 
  Globe, 
  Server, 
  Boxes, 
  KeyRound, 
  HelpCircle 
} from 'lucide-react';

interface AssetTypeBadgeProps {
  type: AssetType;
  showLabel?: boolean;
  className?: string;
}

const assetConfig: Record<AssetType, { 
  label: string; 
  icon: typeof Code2;
  color: string;
}> = {
  js: {
    label: 'JavaScript',
    icon: Code2,
    color: 'text-yellow-400',
  },
  api: {
    label: 'API',
    icon: Globe,
    color: 'text-blue-400',
  },
  infrastructure: {
    label: 'Infrastructure',
    icon: Server,
    color: 'text-purple-400',
  },
  service: {
    label: 'Service',
    icon: Boxes,
    color: 'text-cyan-400',
  },
  secret: {
    label: 'Secret',
    icon: KeyRound,
    color: 'text-critical',
  },
  unknown: {
    label: 'Unknown',
    icon: HelpCircle,
    color: 'text-muted-foreground',
  },
};

export function AssetTypeBadge({ 
  type, 
  showLabel = true,
  className 
}: AssetTypeBadgeProps) {
  const config = assetConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        config.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel && <span className="font-medium">{config.label}</span>}
    </span>
  );
}
