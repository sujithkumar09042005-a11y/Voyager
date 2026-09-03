import React from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  children:  React.ReactNode;
  className?: string;
  icon?:     React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 text-surface-700',
  accent:  'bg-accent-100 text-accent-800',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-700',
  info:    'bg-sky-50 text-sky-700',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs rounded-md gap-1',
  md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
};

export function Badge({
  variant  = 'default',
  size     = 'md',
  children,
  className = '',
  icon,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium whitespace-nowrap',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
