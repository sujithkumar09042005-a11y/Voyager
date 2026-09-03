import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-accent-500 text-white hover:bg-accent-600 shadow-md hover:shadow-accent-500/25',
  secondary: 'glass-subtle text-[var(--text-primary)] hover:bg-white/20 border border-[var(--glass-border)]',
  ghost:     'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10',
  outline:   'border border-[var(--glass-border)] glass-subtle text-[var(--text-primary)] hover:border-accent-500 hover:text-accent-500',
  danger:    'bg-rose-500 text-white hover:bg-rose-600 shadow-sm',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-full font-semibold',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-full font-bold',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-full font-bold',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant  = 'primary',
      size     = 'md',
      loading  = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled  ? {} : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={[
          'inline-flex items-center justify-center cursor-pointer',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        disabled={isDisabled}
        {...(props as any)}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
