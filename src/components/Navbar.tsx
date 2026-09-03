import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, Sun, Moon, Navigation } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LocationDetectorModal } from './LocationDetectorModal';

const NAV_LINKS = [
  { to: '/explore',   label: 'Explore' },
  { to: '/itinerary', label: 'Plan a Trip' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const rafRef = useRef<number | null>(null);

  const isHero = location.pathname === '/';
  const onHeroBeforeScroll = isHero && !scrolled;

  // Smooth hysteresis scroll listener with requestAnimationFrame to eliminate stutter/glitch
  useEffect(() => {
    let lastKnownScroll = window.scrollY;

    const updateScrollState = () => {
      // Hysteresis: turn on at > 45px, turn off only when back above 15px
      if (!scrolled && lastKnownScroll > 45) {
        setScrolled(true);
      } else if (scrolled && lastKnownScroll < 15) {
        setScrolled(false);
      }
      rafRef.current = null;
    };

    const handleScroll = () => {
      lastKnownScroll = window.scrollY;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [scrolled]);

  // Close mobile menu on route change & Escape key
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const textPrimaryClass = onHeroBeforeScroll ? 'text-white' : 'text-[var(--text-primary)]';
  const textSecondaryClass = onHeroBeforeScroll
    ? 'text-white/85 hover:text-white'
    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 transition-colors duration-300">
        {/* Hardware-accelerated background layer: eliminates filter re-paint glitches */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-400 ease-out ${
            scrolled
              ? 'opacity-100 bg-[var(--glass-bg)] backdrop-blur-[16px] border-b border-[var(--glass-border)] shadow-glass-sm'
              : isHero
              ? 'opacity-100 bg-gradient-to-b from-black/75 via-black/35 to-transparent'
              : 'opacity-100 bg-[var(--glass-bg-subtle)] backdrop-blur-md border-b border-[var(--glass-border-subtle)]'
          }`}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <nav className="flex items-center justify-between h-full" aria-label="Main navigation">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md border border-white/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/icon.png"
                  alt="Voyager Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight flex items-center gap-1.5 transition-colors duration-300 ${textPrimaryClass}`}>
                  Voyager
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                </span>
                <span className={`text-2xs font-semibold -mt-1 hidden sm:inline transition-colors duration-300 ${onHeroBeforeScroll ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>
                  Next-Gen Travel Explorer
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${
              onHeroBeforeScroll
                ? 'bg-black/35 border-white/20 backdrop-blur-md'
                : 'glass-subtle border-[var(--glass-border)]'
            }`}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => [
                    'px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'bg-accent-500 text-white shadow-md'
                      : `${textSecondaryClass} hover:bg-white/10`,
                  ].join(' ')}
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                onClick={() => setLocationModalOpen(true)}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer ${textSecondaryClass} hover:bg-white/10`}
                title="Detect Real-Time Location"
              >
                <Navigation size={13} className="text-accent-500" />
                <span>Near Me</span>
              </button>
            </div>

            {/* Right Controls: Currency Badge, Theme Toggle, Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Currency Badge */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-all duration-300 ${
                onHeroBeforeScroll
                  ? 'bg-black/35 border-white/20 text-white backdrop-blur-md'
                  : 'glass-subtle text-[var(--text-primary)] border-[var(--glass-border)]'
              }`}>
                <span className="text-accent-500 font-extrabold">₹</span>
                <span>INR</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none shadow-sm cursor-pointer border ${
                  onHeroBeforeScroll
                    ? 'bg-black/35 border-white/20 text-white hover:bg-black/55 backdrop-blur-md'
                    : 'glass-card border-[var(--glass-border)] text-[var(--text-primary)] hover:border-accent-500'
                }`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <Sun size={18} className="text-amber-300" />
                  ) : (
                    <Moon size={18} className="text-midblue-500" />
                  )}
                </motion.div>
              </button>

              {/* Mobile menu button */}
              <button
                className={`md:hidden p-2 rounded-xl border focus:outline-none transition-colors duration-300 ${
                  onHeroBeforeScroll
                    ? 'bg-black/35 border-white/20 text-white'
                    : 'glass-card border-[var(--glass-border)] text-[var(--text-primary)]'
                }`}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden glass-panel border-t border-[var(--glass-border)] shadow-xl mx-3 mb-3 p-4 space-y-3 rounded-3xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                        isActive
                          ? 'bg-accent-500 text-white shadow-sm'
                          : 'text-[var(--text-primary)] hover:bg-white/10'
                      }`
                    }
                  >
                    <Compass size={18} />
                    {link.label}
                  </NavLink>
                ))}

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[var(--text-primary)] hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Navigation size={18} className="text-accent-500" />
                  Detect Location Near Me
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] px-2 font-medium">
                <span>Currency: <strong className="text-accent-500 font-bold">Indian Rupee (₹)</strong></span>
                <span className="capitalize font-bold">{theme} Mode</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Real-time Location Detector Modal */}
      <LocationDetectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
}
