import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, RefreshCw, AlertCircle, Bot, Sparkles, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Destination } from '../../types';
import { useItineraryAssistant } from '../../hooks/useItineraryAssistant';

interface ChatbotPanelProps {
  destination?: Destination;
}

/** Starter questions. On a destination page they name the place, which gives better answers. */
function getSuggestions(destination?: Destination): string[] {
  if (destination) {
    return [
      `What should I eat in ${destination.name}?`,
      `How many days do I need in ${destination.name}?`,
      `What is a realistic daily budget for ${destination.name}?`,
      `What should I pack for ${destination.name}?`,
    ];
  }
  return [
    'Where should I go for a first trip abroad?',
    'Best beach destinations in March?',
    'Plan a 5 day trip on a mid-range budget',
    'Which destinations are good for food lovers?',
  ];
}

export function ChatbotPanel({ destination }: ChatbotPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input,  setInput]  = useState('');
  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const inputRef             = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, sendMessage, stop, clearError, clearChat } =
    useItineraryAssistant(destination);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened & handle Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 250);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        const trigger = document.getElementById('chatbot-trigger');
        trigger?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* ─── Launcher button ─────────────────────────────────────── */}
      <button
        id="chatbot-trigger"
        onClick={() => setIsOpen(true)}
        className={[
          'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full',
          'bg-accent-500 text-onaccent shadow-2xl hover:bg-accent-600',
          'flex items-center justify-center',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500',
          'border border-white/30',
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ].join(' ')}
        aria-label="Open Voyager AI Assistant"
        title="Voyager AI Assistant"
      >
        <MessageCircle size={24} />
        {messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 text-onaccent text-2xs font-extrabold rounded-full flex items-center justify-center shadow-md">
            {messages.length - 1}
          </span>
        )}
      </button>

      {/* ─── Chat panel ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className={[
                'fixed z-50',
                'inset-0 sm:inset-auto',
                'sm:bottom-6 sm:right-6',
                'sm:w-[460px] sm:h-[640px]',
                'bg-[var(--surface)] sm:rounded-2xl shadow-2xl',
                'flex flex-col overflow-hidden',
                'border border-[var(--glass-border)]',
              ].join(' ')}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.34, 1.1, 0.64, 1] }}
              role="dialog"
              aria-label="Voyager AI travel assistant"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border-subtle)] bg-[var(--glass-bg-subtle)] flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 flex-shrink-0 rounded-2xl bg-accent-500 text-onaccent flex items-center justify-center shadow-md">
                    <Bot size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold leading-tight text-[var(--text-primary)] truncate">
                        Voyager AI Assistant
                      </p>
                      <Sparkles size={13} className="text-accent-500" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-none mt-1">
                      {destination ? `Specialized in ${destination.name}, ${destination.country}` : 'Global travel guide'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={clearChat}
                    className="min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover-tint transition-colors"
                    aria-label="Start a new chat"
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    <span className="whitespace-nowrap">New chat</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover-tint transition-colors"
                    aria-label="Close chat"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div
                className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[var(--surface)]"
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={[
                        'w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm',
                        msg.role === 'user'
                          ? 'bg-accent-500 text-onaccent'
                          : 'glass-subtle text-accent-500 border border-accent-500/30',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {msg.role === 'user' ? 'U' : <Bot size={15} />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={[
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                        msg.role === 'user'
                          ? 'bg-accent-500 text-onaccent rounded-tr-sm shadow-md'
                          : 'glass-card text-[var(--text-primary)] rounded-tl-sm border border-[var(--glass-border)]',
                      ].join(' ')}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="chat-markdown">
                          {msg.degraded && (
                            <p className="mb-2 text-xs font-semibold text-[var(--danger)]" role="note">
                              Offline guide. The AI is busy, so this is general advice, not an answer to your question.
                            </p>
                          )}
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl glass-subtle text-accent-500 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-accent-500/30 shadow-sm">
                      <Bot size={15} />
                    </div>
                    <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 border border-[var(--glass-border)]">
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-accent-400 rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.length <= 1 && !isLoading && (
                  <div className="pt-1" aria-label="Suggested questions">
                    <p className="legend-label mb-2" style={{ fontSize: '0.75rem' }}>Try asking</p>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestions(destination).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="min-h-[44px] text-left px-3.5 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-raised)] text-sm text-[var(--text-primary)] hover:border-accent-500"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Error banner */}
              {error && (
                <div role="alert" className="px-4 py-2.5 mx-4 mb-2 border border-[var(--danger)] rounded-xl flex items-center justify-between text-sm text-[var(--danger)]">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button onClick={clearError} className="ml-2 min-h-[44px] px-2 text-sm underline">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Input row */}
              <div className="p-4 border-t border-[var(--glass-border-subtle)] bg-[var(--glass-bg-subtle)] flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={destination ? `Ask about ${destination.name}` : 'Ask about any destination'}
                    className="flex-1 glass-subtle text-[var(--text-primary)] placeholder-[var(--input-placeholder)] text-sm px-4 py-3 rounded-2xl border border-[var(--glass-border)] focus:outline-none focus:border-accent-500 transition-colors font-medium"
                    disabled={isLoading}
                    aria-label="Message to Voyager travel assistant"
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stop}
                      className="min-h-[44px] px-4 rounded-2xl flex items-center gap-2 flex-shrink-0 border border-[var(--line)] bg-[var(--surface-raised)] text-sm font-semibold text-[var(--text-primary)] hover:border-accent-500"
                      aria-label="Stop generating"
                    >
                      <Square size={13} aria-hidden="true" fill="currentColor" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className={[
                        'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-md',
                        input.trim()
                          ? 'bg-accent-500 hover:bg-accent-600 text-onaccent cursor-pointer'
                          : 'bg-[var(--surface-sunken)] text-[var(--text-muted)] cursor-not-allowed',
                      ].join(' ')}
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
