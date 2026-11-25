/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMotionValue } from 'framer-motion';

const ScrollTelemetryContext = createContext(null);
const ActiveNavContext = createContext(null);

const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];
const NAVBAR_HEIGHT = 80; // Matches Navbar h-20 (80px)

// Custom ease-in-out cubic scroll animation that cleanly yields on manual user input
const smoothScrollToTarget = (targetY, duration = 850) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return () => {};

  const startTime = performance.now();
  let rafId = null;
  let cancelled = false;

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('pointerdown', cancel);
  };

  window.addEventListener('wheel', cancel, { passive: true, once: true });
  window.addEventListener('touchstart', cancel, { passive: true, once: true });
  window.addEventListener('pointerdown', cancel, { passive: true, once: true });

  const step = (currentTime) => {
    if (cancelled) return;
    const elapsed = (currentTime - startTime) / duration;
    if (elapsed >= 1) {
      window.scrollTo(0, targetY);
      cancel();
      return;
    }
    const ease = elapsed < 0.5
      ? 4 * elapsed * elapsed * elapsed
      : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
    window.scrollTo(0, startY + distance * ease);
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
  return cancel;
};

export const ScrollProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const scrollProgressMV = useMotionValue(0);
  const metricsRef = useRef({
    scrollProgress: 0,
    activeSection: 'hero',
    sectionProgress: {}
  });
  const warpTimeoutRef = useRef(null);
  const cancelScrollRef = useRef(null);

  const getScrollMetrics = useCallback(() => metricsRef.current, []);

  const triggerWarp = useCallback((targetSectionId) => {
    setIsWarping(true);
    if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);
    if (cancelScrollRef.current) cancelScrollRef.current();

    if (targetSectionId) {
      const cleanId = targetSectionId.replace('#', '');
      const el = document.getElementById(cleanId);
      if (el) {
        const targetPosition = Math.max(0, el.offsetTop - NAVBAR_HEIGHT);
        cancelScrollRef.current = smoothScrollToTarget(targetPosition, 850);
      }
    }

    warpTimeoutRef.current = setTimeout(() => {
      setIsWarping(false);
    }, 850);
  }, []);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(1, document.documentElement.scrollHeight - windowHeight);
    const totalProgress = Math.min(Math.max(0, scrollY / documentHeight), 1);

    // Update GPU-friendly MotionValue and ref directly (zero React re-renders for 3D scene)
    scrollProgressMV.set(totalProgress);

    const sectionPositions = {};
    let currentActive = 'hero';
    let maxIntersection = -1;

    SECTIONS.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const sectionStart = elementTop - windowHeight * 0.3;
        const sectionEnd = elementTop + elementHeight - windowHeight * 0.7;
        const denom = Math.max(1, sectionEnd - sectionStart);
        sectionPositions[sectionId] = Math.max(0, Math.min(1, (scrollY - sectionStart) / denom));

        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        if (visibleHeight > maxIntersection && visibleHeight > 0) {
          maxIntersection = visibleHeight;
          currentActive = sectionId;
        }
      }
    });

    metricsRef.current = {
      scrollProgress: totalProgress,
      activeSection: currentActive,
      sectionProgress: sectionPositions
    };

    const nextPercent = Math.round(totalProgress * 100);
    setActiveSection((prev) => (prev === currentActive ? prev : currentActive));
    setScrollPercent((prev) => (prev === nextPercent ? prev : nextPercent));
  }, [scrollProgressMV]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    const raf = requestAnimationFrame(handleScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
      if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);
      if (cancelScrollRef.current) cancelScrollRef.current();
    };
  }, [handleScroll]);

  const telemetryValue = useMemo(
    () => ({ isWarping, triggerWarp, getScrollMetrics, scrollProgressMV }),
    [isWarping, triggerWarp, getScrollMetrics, scrollProgressMV]
  );

  const navValue = useMemo(
    () => ({ activeSection, scrollPercent }),
    [activeSection, scrollPercent]
  );

  return (
    <ScrollTelemetryContext.Provider value={telemetryValue}>
      <ActiveNavContext.Provider value={navValue}>
        {children}
      </ActiveNavContext.Provider>
    </ScrollTelemetryContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollTelemetryContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};

export const useActiveNav = () => {
  const context = useContext(ActiveNavContext);
  if (!context) {
    throw new Error('useActiveNav must be used within a ScrollProvider');
  }
  return context;
};
