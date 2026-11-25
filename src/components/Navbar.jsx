import { useState } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Menu, X, Terminal, Radio } from 'lucide-react';
import { useScroll, useActiveNav } from './ScrollContext';

const NAV_LINKS = [
  { id: 'hero', name: 'Home', code: '00' },
  { id: 'about', name: 'About', code: '01' },
  { id: 'skills', name: 'Skills', code: '02' },
  { id: 'projects', name: 'Projects', code: '03' },
  { id: 'contact', name: 'Contact', code: '04' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const { scrollProgressMV, triggerWarp, isWarping } = useScroll();
  const { activeSection, scrollPercent } = useActiveNav();

  // Pipe scrollProgressMV through smooth liquid spring for laser line continuity without React re-renders
  const smoothProgress = useSpring(scrollProgressMV, {
    stiffness: 140,
    damping: 24,
    mass: 0.15
  });

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsOpen(false);
    triggerWarp(targetId);
  };

  const activeIndex = NAV_LINKS.findIndex((link) => link.id === activeSection);
  const activeCode = activeIndex >= 0 ? NAV_LINKS[activeIndex].code : '00';

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed top-0 left-0 w-full z-50 bg-[#020610]/85 backdrop-blur-md border-b border-sensor/20 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand & Telemetry Badge */}
          <div className="flex items-center gap-4">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, 'hero')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <Terminal className="text-target h-7 w-7 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sensor animate-ping" />
              </div>
              <span className="font-mono text-2xl font-bold tracking-wide text-sensor drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <span className="text-target">0x</span>Prasun
              </span>
            </a>

            {/* Live Orbit Status Telemetry */}
            <div className="hidden xl:flex items-center gap-2.5 pl-4 border-l border-sensor/25 text-xs font-mono text-sensor/75">
              <Radio className="w-3.5 h-3.5 text-target animate-pulse" />
              <span>SYS.NAV // [{activeCode}/04] {activeSection.toUpperCase()}</span>
              <span className="text-phosphor/40">|</span>
              <span className="text-phosphor font-semibold">{scrollPercent}% ORBIT</span>
              {isWarping && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-target font-bold animate-pulse tracking-widest pl-2"
                >
                  [ WARP SPEED ]
                </motion.span>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links with Sliding HUD Reticle */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1 lg:space-x-3">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                const isHovered = hoveredLink === link.id;

                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(e, link.id)}
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-4 py-2 font-mono text-base font-semibold tracking-wider transition-colors duration-300 ${
                      isActive ? 'text-sensor font-bold' : 'text-phosphor/80 hover:text-sensor'
                    }`}
                  >
                    {/* Velvety Sliding HUD Reticle on Active Link */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 border border-sensor/70 bg-sensor/10 backdrop-blur-sm -z-10 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                        transition={{ type: "spring", stiffness: 190, damping: 24, mass: 0.5 }}
                      >
                        {/* Tactical HUD Corner Crosshairs */}
                        <span className="absolute -top-[2px] -left-[2px] w-2 h-2 border-t-2 border-l-2 border-target" />
                        <span className="absolute -top-[2px] -right-[2px] w-2 h-2 border-t-2 border-r-2 border-target" />
                        <span className="absolute -bottom-[2px] -left-[2px] w-2 h-2 border-b-2 border-l-2 border-target" />
                        <span className="absolute -bottom-[2px] -right-[2px] w-2 h-2 border-b-2 border-r-2 border-target" />
                      </motion.div>
                    )}

                    {/* Interactive hover targeting brackets */}
                    {!isActive && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 border border-sensor/30 bg-sensor/5 -z-10"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className="text-target text-xs opacity-75">[{link.code}]</span>
                      <span>{link.name}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-menu"
              aria-label="Toggle Navigation"
              className="inline-flex items-center justify-center p-2.5 border border-sensor/30 text-phosphor hover:text-sensor hover:border-sensor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sensor transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6 text-target" /> : <Menu className="h-6 w-6 text-sensor" />}
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Laser Telemetry Progress Beam across bottom of Navbar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sensor/15 overflow-hidden pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-target via-sensor to-target shadow-[0_0_14px_#00E5FF]"
          style={{
            scaleX: smoothProgress,
            transformOrigin: 'left'
          }}
        />
      </div>

      {/* Holographic Blast-Door Mobile Menu with Staggered Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-sensor/30 bg-[#020610]/95 backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Ambient scanlines */}
            <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

            <div className="px-4 pt-3 pb-6 space-y-2 relative z-10">
              <div className="text-[10px] font-mono tracking-[0.25em] text-sensor/70 pb-2 border-b border-sensor/20 flex justify-between items-center gap-3">
                <span>MISSION DIRECTORY // </span>
                <span className="text-rose-300 font-bold">{scrollPercent}% ORBIT</span>
              </div>

              {NAV_LINKS.map((link, idx) => {
                const isActive = activeSection === link.id;

                return (
                  <motion.a
                    key={link.id}
                    href={`#${link.id}`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => handleNavClick(e, link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group flex items-center justify-between px-4 py-3 border font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? 'border-sensor bg-sensor/15 text-sensor shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                        : 'border-sensor/15 text-phosphor/80 hover:border-sensor/50 hover:text-sensor hover:bg-sensor/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-target text-xs font-bold">[{link.code}]</span>
                      <span className="font-semibold text-lg">{link.name}</span>
                    </div>
                    {isActive ? (
                      <span className="text-xs font-mono text-sensor animate-pulse tracking-widest">
                        &lt;ACTIVE ORBIT&gt;
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-phosphor/40 group-hover:text-sensor transition-colors">
                        ENGAGE &gt;
                      </span>
                    )}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
