import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotPanel } from './features/chatbot/ChatbotPanel';
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1], // Smooth Apple / fluid deceleration curve
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Scroll restorative controller */}
      <ScrollToTop />

      {/* Interactive Custom Cursor */}
      <CustomCursor />

      {/* Accessible skip link: slides down on Tab key focus */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      {/* Global Ambient Mesh Gradient */}
      <div className="background-mesh" aria-hidden="true" />

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
                      className="px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
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
      <ChatbotPanel />

      {/* Full Modern Glassmorphic Footer */}
      <Footer />
    </div>
  );
}
