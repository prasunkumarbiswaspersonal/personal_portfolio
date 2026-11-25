import { lazy, Suspense } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { ScrollProvider } from './components/ScrollContext';

// Hero3D pulls in Three.js (~1MB); lazy-load it so it lands in its own chunk
// and never blocks first paint of the page content.
const Hero3D = lazy(() => import('./components/Hero3D').then((m) => ({ default: m.Hero3D })));

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProvider>
        <div className="min-h-screen bg-void text-phosphor selection:bg-target selection:text-void">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[120] focus:px-4 focus:py-2 focus:bg-void focus:text-sensor focus:border focus:border-sensor focus:font-mono focus:text-sm"
          >
            Skip to main content
          </a>
          <div className="scanlines"></div>

          {/* Global 3D Background - Fixed behind all content */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Suspense fallback={null}>
              <Hero3D />
            </Suspense>
          </div>

          {/* Global Background Animations */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            {/* Dynamic Background Glow - Deep space nebula glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-[#1a00ff]/5 rounded-full blur-[150px] animate-pulse" />

            {/* Floating Orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Inlined Tactical HUD Crosshair (zero external CDN request) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-[460px] h-[460px] md:w-[680px] md:h-[680px] text-target animate-[spin_180s_linear_infinite]"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="100" cy="100" r="88" strokeWidth="0.75" strokeDasharray="6 6" />
                <circle cx="100" cy="100" r="64" strokeWidth="1" />
                <circle cx="100" cy="100" r="32" strokeWidth="0.75" strokeDasharray="3 4" />
                <circle cx="100" cy="100" r="4" strokeWidth="1.25" />
                <line x1="100" y1="2" x2="100" y2="48" strokeWidth="1" />
                <line x1="100" y1="152" x2="100" y2="198" strokeWidth="1" />
                <line x1="2" y1="100" x2="48" y2="100" strokeWidth="1" />
                <line x1="152" y1="100" x2="198" y2="100" strokeWidth="1" />
              </svg>
              <div className="absolute inset-0 bg-void/40 backdrop-blur-[2px] rounded-full" />
            </motion.div>
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main id="main-content" className="flex-grow">
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Contact />
            </main>
            <Footer />
          </div>
        </div>
      </ScrollProvider>
    </MotionConfig>
  );
}

export default App;
