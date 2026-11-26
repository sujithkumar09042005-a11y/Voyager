import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, matchPath } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotPanel } from './features/chatbot/ChatbotPanel';
import destinations from './data/destinations.json';
import type { Destination } from './types';
import { HeroSection } from './features/hero/HeroSection';
import { ExplorerPage } from './features/explorer/ExplorerPage';
import { DestinationDetailPage } from './features/destination-detail/DestinationDetailPage';
import { ItineraryPage } from './features/itinerary/ItineraryPage';
import { CustomCursor } from './components/ui/CustomCursor';

// ─── Scroll to top on route change ───────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant scroll to top on route change for smooth transition entry
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// ─── Smooth fluid page transition wrapper ─────────────────────────────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

/** After a route change, move keyboard and screen-reader focus to the new page's heading. */
function FocusOnNavigate() {
  const { pathname } = useLocation();
  // Compare with the previous path instead of counting renders: StrictMode runs effects twice in
  // development, which would make a "first render" flag fire on the initial page load.
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const id = window.setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    }, 200); // after the exit animation has finished
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation();
  const destinationId = matchPath('/destination/:id', location.pathname)?.params.id;
  const chatDestination = (destinations as Destination[]).find((d) => d.id === destinationId);

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col relative">
      {/* Scroll restorative controller */}
      <ScrollToTop />
      <FocusOnNavigate />

      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* Accessible skip link: slides down on Tab key focus */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      {/* Persistent Navigation */}
      <Navbar />

      {/* Fluid Page transitions */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <HeroSection />
                </PageWrapper>
              }
            />
            <Route
              path="/explore"
              element={
                <PageWrapper>
                  <ExplorerPage />
                </PageWrapper>
              }
            />
            <Route
              path="/destination/:id"
              element={
                <PageWrapper>
                  <DestinationDetailPage />
                </PageWrapper>
              }
            />
            <Route
              path="/itinerary"
              element={
                <PageWrapper>
                  <ItineraryPage />
                </PageWrapper>
              }
            />
            {/* 404 */}
            <Route
              path="*"
              element={
                <PageWrapper>
                  <main id="main-content" className="min-h-[70vh] flex flex-col items-center justify-center pt-28 text-center px-4">
                    <p className="font-display text-7xl font-extrabold text-accent-500 mb-4">404</p>
                    <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
                      Destination Not Found
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                      The uncharted territory you're looking for doesn't exist on Voyager yet.
                    </p>
                    <a
                      href="/"
                      className="px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-onaccent font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
                    >
                      ← Return to Voyager Home
                    </a>
                  </main>
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Global Voyager AI chatbot */}
      {/* On a destination page the assistant is scoped to that destination */}
      <ChatbotPanel key={chatDestination?.id ?? 'global'} destination={chatDestination} />

      {/* Full Modern Glassmorphic Footer */}
      <Footer />
    </div>
    </MotionConfig>
  );
}
