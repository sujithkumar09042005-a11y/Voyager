import { Link } from 'react-router-dom';
import { ArrowUp, Sparkles, Globe, MapPin, IndianRupee, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Footer() {
  const { theme, toggleTheme } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-auto border-t border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl transition-colors duration-300">
      {/* Decorative top ambient glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none w-fit">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-lg border border-white/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/icon.png"
                  alt="Voyager Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
                  Voyager
                  <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                </span>
                <span className="text-2xs font-semibold text-[var(--text-muted)] -mt-1">
                  Next-Gen Travel Explorer
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Voyager blends modern glassmorphic aesthetics with real-time GPS location detection, live meteorological intelligence, verified Pexels photography, and Google Gemini AI itinerary crafting.
            </p>

            {/* Live Operational Status Badge */}
            <div className="flex items-center gap-2.5 pt-2">
              <div className="glass-subtle px-3 py-1.5 rounded-full border border-[var(--glass-border)] flex items-center gap-2 shadow-sm text-2xs font-semibold text-[var(--text-secondary)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>OpenWeather · Pexels · Gemini AI Live</span>
              </div>
            </div>
          </div>

          {/* Col 3: Discover Global Escapes */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--text-primary)] tracking-wide uppercase">
              Top Destinations
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link to="/destination/kyoto-japan" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Kyoto, Japan
                </Link>
              </li>
              <li>
                <Link to="/destination/rajasthan-india" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Jaipur & Udaipur, India
                </Link>
              </li>
              <li>
                <Link to="/destination/amalfi-coast-italy" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Amalfi Coast, Italy
                </Link>
              </li>
              <li>
                <Link to="/destination/santorini-greece" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Santorini, Greece
                </Link>
              </li>
              <li>
                <Link to="/destination/bali-indonesia" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Bali & Ubud, Indonesia
                </Link>
              </li>
              <li>
                <Link to="/destination/swiss-alps-switzerland" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <MapPin size={11} className="text-accent-500" />
                  Swiss Alps, Switzerland
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Features */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--text-primary)] tracking-wide uppercase">
              Explorer Suite
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link to="/explore" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <Globe size={11} className="text-accent-500" />
                  All 34 Global Destinations
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-accent-500 transition-colors flex items-center gap-1.5">
                  <Sparkles size={11} className="text-accent-500" />
                  AI Itinerary Generator
                </Link>
              </li>
              <li>
                <Link to="/explore?vibe=culture" className="hover:text-accent-500 transition-colors">
                  Culture & Heritage Tours
                </Link>
              </li>
              <li>
                <Link to="/explore?vibe=food" className="hover:text-accent-500 transition-colors">
                  Street Food & Dining Escapes
                </Link>
              </li>
              <li>
                <Link to="/explore?vibe=coastal" className="hover:text-accent-500 transition-colors">
                  Coastal & Beach Getaways
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Theme & Preferences */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--text-primary)] tracking-wide uppercase">
              Preferences
            </h4>
            <div className="space-y-3 text-xs">
              <div className="glass-subtle p-3 rounded-2xl border border-[var(--glass-border)] space-y-2">
                <div className="flex items-center justify-between text-[var(--text-secondary)] font-semibold">
                  <span>Currency Baseline</span>
                  <span className="text-accent-500 font-extrabold flex items-center gap-0.5">
                    <IndianRupee size={12} /> INR
                  </span>
                </div>
                <p className="text-2xs text-[var(--text-muted)] leading-tight">
                  All hotel, activity, and dining estimates are benchmarked in Indian Rupees (₹).
                </p>
              </div>

              {/* Theme Toggle in Footer */}
              <button
                onClick={toggleTheme}
                className="w-full glass-card p-2.5 rounded-2xl flex items-center justify-between border border-[var(--glass-border)] text-[var(--text-primary)] hover:border-accent-500 transition-all cursor-pointer font-bold"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon size={14} className="text-cyan-400" /> : <Sun size={14} className="text-amber-500" />}
                  <span>{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</span>
                </span>
                <span className="text-2xs font-semibold text-accent-500">Toggle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Back to Top */}
        <div className="pt-8 border-t border-[var(--glass-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Voyager Travel Inc. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Crafted for modern explorers</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="glass-subtle hover:glass-card px-4 py-2 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-accent-500 transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Back to Top of Page"
            >
              <span>Back to top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
