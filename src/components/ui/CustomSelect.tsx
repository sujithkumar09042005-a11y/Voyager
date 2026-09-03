import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  className?: string;
}

export function CustomSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  icon,
  searchable = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  // Reset or initialize highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, filteredOptions.length]);

  // Handle keyboard events (Escape, Arrows, Enter, Home, End)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if (
          document.activeElement === triggerButtonRef.current &&
          (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')
        ) {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerButtonRef.current?.focus();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0
        );
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlightedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    if (isOpen && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, searchable, highlightedIndex, filteredOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && optionsContainerRef.current) {
      const optionElements = optionsContainerRef.current.querySelectorAll('[role="option"]');
      if (optionElements[highlightedIndex]) {
        (optionElements[highlightedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
    triggerButtonRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={[
          'w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:py-4 rounded-2xl text-left',
          'glass-subtle border border-[var(--glass-border)] hover:border-accent-500',
          'focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20',
          'transition-all duration-200 shadow-sm cursor-pointer',
          isOpen ? 'border-accent-500 shadow-md ring-2 ring-accent-500/20' : '',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && <span className="text-accent-500 flex-shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--text-primary)] text-sm sm:text-base truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.subtext && (
                  <span className="text-2xs sm:text-xs font-semibold text-accent-500 glass-subtle px-2.5 py-0.5 rounded-full flex-shrink-0">
                    {selectedOption.subtext}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[var(--input-placeholder)] text-sm sm:text-base font-medium">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-accent-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Custom Glassmorphic Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 z-50 mt-1 max-h-72 glass-panel rounded-2xl shadow-2xl border border-[var(--glass-border)] overflow-hidden flex flex-col p-1.5"
            role="listbox"
            tabIndex={-1}
          >
            {/* Search filter if enabled */}
            {searchable && (
              <div className="p-2 border-b border-[var(--glass-border-subtle)]">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3 text-accent-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-subtle text-[var(--text-primary)] border border-[var(--glass-border-subtle)] focus:outline-none focus:border-accent-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div ref={optionsContainerRef} className="overflow-y-auto flex-1 p-1 space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] font-medium">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      role="option"
                      aria-selected={isSelected}
                      className={[
                        'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm transition-all cursor-pointer',
                        isSelected
                          ? 'bg-accent-500 text-white font-bold shadow-sm'
                          : isHighlighted
                          ? 'bg-accent-500/15 text-[var(--text-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {opt.subtext && (
                          <span
                            className={[
                              'text-2xs px-2 py-0.5 rounded-full font-medium',
                              isSelected ? 'bg-white/20 text-white' : 'glass-subtle text-accent-500',
                            ].join(' ')}
                          >
                            {opt.subtext}
                          </span>
                        )}
                        {isSelected && <Check size={16} className="text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
