import React from 'react';
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning,
  Wind, Droplets, Eye, Thermometer, AlertCircle, RefreshCw,
} from 'lucide-react';
import type { WeatherCondition, WeatherData } from '../types';
import { WeatherWidgetSkeleton } from './ui/Skeleton';
import { Button } from './ui/Button';

// ─── Weather Icon Mapping ─────────────────────────────────────────────────────

interface WeatherIconProps {
  condition: WeatherCondition;
  size?:     number;
  className?: string;
}

const ICON_MAP: Record<WeatherCondition, React.ElementType> = {
  'clear':        Sun,
  'partly-cloudy': Cloud,
  'cloudy':       Cloud,
  'rain':         CloudRain,
  'drizzle':      CloudDrizzle,
  'thunderstorm': CloudLightning,
  'snow':         CloudSnow,
  'mist':         Wind,
  'unknown':      Sun,
};

const ICON_COLOR: Record<WeatherCondition, string> = {
  'clear':        'text-amber-400',
  'partly-cloudy': 'text-cyan-400',
  'cloudy':       'text-slate-400',
  'rain':         'text-sky-400',
  'drizzle':      'text-teal-400',
  'thunderstorm': 'text-violet-400',
  'snow':         'text-sky-200',
  'mist':         'text-slate-300',
  'unknown':      'text-amber-400',
};

function WeatherIcon({ condition, size = 42, className = '' }: WeatherIconProps) {
  const Icon = ICON_MAP[condition];
  return <Icon size={size} className={`${ICON_COLOR[condition]} ${className}`} />;
}

// ─── Weather Widget ───────────────────────────────────────────────────────────

interface WeatherWidgetProps {
  isLoading:  boolean;
  isError:    boolean;
  data?:      WeatherData;
  cityName?:  string;
  onRetry?:   () => void;
}

export function WeatherWidget({
  isLoading,
  isError,
  data,
  cityName,
  onRetry,
}: WeatherWidgetProps) {
  // Loading state
  if (isLoading) {
    return <WeatherWidgetSkeleton />;
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="rounded-3xl p-6 glass-panel border border-red-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)]">Live Weather Unavailable</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Could not retrieve real-time meteorological metrics.
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw size={13} />}
              className="glass-subtle text-xs"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-6 glass-panel space-y-4 border border-[var(--glass-border)] shadow-glass-md">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          {cityName && (
            <p className="text-2xs font-bold text-accent-500 uppercase tracking-widest mb-0.5">
              Live Weather · {cityName}
            </p>
          )}
          <p className="text-2xs text-[var(--text-muted)] font-mono">
            Updated {data.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center shadow-inner">
          <WeatherIcon condition={data.condition} size={32} />
        </div>
      </div>

      {/* Temperature */}
      <div className="flex items-end gap-3 pt-1">
        <span className="font-display text-5xl font-extrabold text-[var(--text-primary)] leading-none">
          {data.temperature}°C
        </span>
        <div className="pb-1">
          <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{data.conditionText}</p>
          <p className="text-xs text-[var(--text-muted)]">Feels like {data.feelsLike}°C</p>
        </div>
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--glass-border-subtle)] text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 glass-subtle px-3 py-2 rounded-xl">
          <Droplets size={14} className="text-sky-400 flex-shrink-0" />
          <span>{data.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-2 glass-subtle px-3 py-2 rounded-xl">
          <Wind size={14} className="text-cyan-400 flex-shrink-0" />
          <span>{data.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-2 glass-subtle px-3 py-2 rounded-xl">
          <Eye size={14} className="text-slate-400 flex-shrink-0" />
          <span>{data.visibility} km vis</span>
        </div>
        <div className="flex items-center gap-2 glass-subtle px-3 py-2 rounded-xl">
          <Thermometer size={14} className="text-accent-400 flex-shrink-0" />
          <span>{data.feelsLike}° feels</span>
        </div>
      </div>
    </div>
  );
}
