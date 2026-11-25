import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Navigation } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LocationDetectorModal } from './LocationDetectorModal';
import { LampCord } from './LampCord';

const NAV_LINKS = [
  { to: '/explore',   label: 'Explore' },
  { to: '/itinerary', label: 'Plan a Trip' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer and returns focus to the menu button; Tab stays inside it
  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll<HTMLElement>('a, button');
    focusables?.[0]?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="nav-shell">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px]">
            <nav className="flex items-center justify-between h-full" aria-label="Main navigation">
              {/* Wordmark: the title cartouche */}
              <Link to="/" className="flex items-center gap-3 group" aria-label="Voyager, home">
                <span className="w-10 h-10 rounded-full overflow-hidden border border-[var(--line)] flex-shrink-0">
                  <img src="/icon.png" alt="" className="w-full h-full object-cover" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-2xl text-[var(--text-primary)]">Voyager</span>
                  <span className="legend-label mt-1 hidden sm:block" style={{ fontSize: '0.75rem' }}>
                    Atlas of destinations
                  </span>
                </span>
              </Link>

              {/* Desktop links: numbered like map sheets */}
              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((link, i) => (
                  <NavLink key={link.to} to={link.to} className="nav-link">
                    <span className="nav-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="nav-link"
                >
                  <span className="nav-index" aria-hidden="true">03</span>
                  Near me
                  <Navigation size={13} className="text-accent-500 self-center" aria-hidden="true" />
                </button>
              </div>

              {/* Right: currency stamp, theme compass, menu */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="nav-chip hidden sm:inline-flex" title="Prices are shown in Indian rupees">
                  INR
                </span>

                <LampCord />

                <button
                  ref={menuButtonRef}
                  type="button"
                  className="md:hidden w-11 h-11 rounded-full flex items-center justify-center border border-[var(--line)] text-[var(--text-primary)]"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile drawer: a folded index of sheets */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              ref={drawerRef}
              className="md:hidden bg-[var(--surface-raised)] border-b-[3px] border-double border-[var(--line)] shadow-[0_24px_40px_-24px_var(--shadow-ink)]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ul className="px-4 py-3">
                {NAV_LINKS.map((link, i) => (
                  <li key={link.to} className="border-b border-dotted border-[var(--line)] last:border-0">
                    <NavLink
                      to={link.to}
                      className="flex items-baseline gap-4 py-4 min-h-[44px] font-display text-xl text-[var(--text-primary)] aria-[current=page]:text-accent-500"
                    >
                      <span className="legend-label" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setLocationModalOpen(true);
                    }}
                    className="w-full flex items-baseline gap-4 py-4 min-h-[44px] font-display text-xl text-[var(--text-primary)] text-left"
                  >
                    <span className="legend-label" aria-hidden="true">03</span>
                    Near me
                    <Navigation size={16} className="text-accent-500 self-center" aria-hidden="true" />
                  </button>
                </li>
              </ul>
              <p className="px-4 pb-4 text-xs text-[var(--text-muted)]">
                Prices in Indian rupees. Theme: {theme === 'dark' ? 'night' : 'day'}. Pull the cord to switch.
              </p>
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
