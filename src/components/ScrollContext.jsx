/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ScrollContext = createContext(null);
const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact'];

// Custom ease-in-out cubic scroll animation for cinematic section transitions
const smoothScrollToTarget = (targetY, duration = 850) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed = (currentTime - startTime) / duration;
    if (elapsed >= 1) {
      window.scrollTo(0, targetY);
      return;
    }
    // High-performance ease-in-out cubic curve
    const ease = elapsed < 0.5
      ? 4 * elapsed * elapsed * elapsed
      : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
    window.scrollTo(0, startY + distance * ease);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

export const ScrollProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionProgress, setSectionProgress] = useState({});
  const [isWarping, setIsWarping] = useState(false);
  const warpTimeoutRef = useRef(null);

  const triggerWarp = useCallback((targetSectionId) => {
    setIsWarping(true);
    if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);

    if (targetSectionId) {
      const cleanId = targetSectionId.replace('#', '');
      const el = document.getElementById(cleanId);
      if (el) {
        const navHeight = 72;
        const targetPosition = Math.max(0, el.offsetTop - navHeight);
        smoothScrollToTarget(targetPosition, 850);
      }
    }

    // Warp sequence duration in harmony with scroll curve
    warpTimeoutRef.current = setTimeout(() => {
      setIsWarping(false);
    }, 850);
  }, []);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(1, document.documentElement.scrollHeight - windowHeight);
    const totalProgress = Math.min(Math.max(0, scrollY / documentHeight), 1);
    setScrollProgress(totalProgress);

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
        const progress = Math.max(0, Math.min(1, (scrollY - sectionStart) / (sectionEnd - sectionStart)));
        sectionPositions[sectionId] = progress;

        // Viewport intersection calculation for accurate active section highlight
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        if (visibleHeight > maxIntersection && visibleHeight > 0) {
          maxIntersection = visibleHeight;
          currentActive = sectionId;
        }
      }
    });

    setActiveSection(currentActive);
    setSectionProgress(sectionPositions);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    const raf = requestAnimationFrame(handleScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
      if (warpTimeoutRef.current) clearTimeout(warpTimeoutRef.current);
    };
  }, [handleScroll]);

  return (
    <ScrollContext.Provider value={{ activeSection, scrollProgress, sectionProgress, isWarping, triggerWarp }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
