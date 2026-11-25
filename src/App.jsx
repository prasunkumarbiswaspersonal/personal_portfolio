import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { ScrollProvider } from './components/ScrollContext';

// Hero3D pulls in Three.js (~243 KiB gzip); mount it on first interaction or idle after initial paint
const Hero3D = lazy(() => import('./components/Hero3D').then((m) => ({ default: m.Hero3D })));

function App() {
  const [shouldMount3D, setShouldMount3D] = useState(false);

  useEffect(() => {
    let active = true;
    const enable3D = () => {
      if (active) setShouldMount3D(true);
    };

    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'mousemove', 'keydown'];
    events.forEach((ev) => window.addEventListener(ev, enable3D, { passive: true, once: true }));

    let timerId = null;
    let idleId = null;
    const scheduleIdleFallback = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(() => {
          timerId = setTimeout(enable3D, 3600);
        }, { timeout: 4000 });
      } else {
        timerId = setTimeout(enable3D, 3800);
      }
    };

    if (document.readyState === 'complete') {
      scheduleIdleFallback();
    } else {
      window.addEventListener('load', scheduleIdleFallback, { once: true });
    }

    return () => {
      active = false;
      events.forEach((ev) => window.removeEventListener(ev, enable3D));
      window.removeEventListener('load', scheduleIdleFallback);
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
    };
  }, []);

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

          {/* Global Deep-Space Backdrop & Deferred 3D Scene */}
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 15% 50%, rgba(20, 5, 40, 0.45) 0%, transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(5, 20, 40, 0.45) 0%, transparent 50%),
                linear-gradient(180deg, #010205 0%, #000000 100%)
              `
            }}
          >
            {shouldMount3D && (
              <Suspense fallback={null}>
                <Hero3D />
              </Suspense>
            )}
          </div>

          {/* Static radial glow discs (replaces heavy blur-[150px] animate-pulse compositor thrashing) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Inlined Tactical HUD Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
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
            </div>
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
