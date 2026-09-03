import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:      string;
  leftIcon?:   React.ReactNode;
  rightElement?: React.ReactNode;
  error?:      string;
  onClear?:    () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftIcon, rightElement, error, onClear, className = '', id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;
    const showClear = onClear && props.value && String(props.value).length > 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 flex items-center text-accent-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full glass-subtle border border-[var(--glass-border)] rounded-2xl',
              'text-[var(--text-primary)] placeholder-[var(--input-placeholder)] font-medium',
              'transition-all duration-200 shadow-sm',
              'focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon  ? 'pl-11'  : 'pl-4',
              (showClear || rightElement) ? 'pr-11' : 'pr-4',
              'py-3 text-xs sm:text-sm',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
              className,
            ].join(' ')}
            {...props}
          />

          {/* Clear button */}
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Clear input"
            >
              <X size={15} />
            </button>
          )}

          {/* Custom right element */}
          {!showClear && rightElement && (
            <div className="absolute right-3.5">{rightElement}</div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500 font-semibold" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─── Search Input Variant ────────────────────────────────────────────────────

interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear: () => void;
}

export function SearchInput({ className = '', ...props }: SearchInputProps) {
  return (
    <Input
      leftIcon={<Search size={18} />}
      className={`text-sm sm:text-base py-3.5 rounded-full ${className}`}
      {...props}
    />
  );
}
