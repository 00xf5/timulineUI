import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';
import { AlertTriangle, AlertCircle, Circle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    icon: AlertCircle,
    bgClass: 'bg-critical-muted',
    textClass: 'text-critical',
    borderClass: 'border-critical/30',
    dotClass: 'bg-critical',
  },
  risk: {
    label: 'Risk',
    icon: AlertTriangle,
    bgClass: 'bg-risk-muted',
    textClass: 'text-risk',
    borderClass: 'border-risk/30',
    dotClass: 'bg-risk',
  },
  noise: {
    label: 'Noise',
    icon: Circle,
    bgClass: 'bg-noise-muted',
    textClass: 'text-noise',
    borderClass: 'border-noise/30',
    dotClass: 'bg-noise',
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-1.5 py-0.5 text-[10px]',
    icon: 'h-3 w-3',
    dot: 'h-1.5 w-1.5',
  },
  md: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3.5 w-3.5',
    dot: 'h-2 w-2',
  },
  lg: {
    badge: 'px-2.5 py-1.5 text-sm',
    icon: 'h-4 w-4',
    dot: 'h-2.5 w-2.5',
  },
};

export function SeverityBadge({ 
  severity, 
  showLabel = true, 
  size = 'md',
  className 
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium uppercase tracking-wide',
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeStyles.badge,
        severity === 'critical' && 'pulse-critical',
        className
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function SeverityDot({ 
  severity, 
  size = 'md',
  className 
}: Omit<SeverityBadgeProps, 'showLabel'>) {
  const config = severityConfig[severity];
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        config.dotClass,
        sizeStyles.dot,
        severity === 'critical' && 'animate-pulse',
        className
      )}
    />
  );
}
