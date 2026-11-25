import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import FragmentedUsername from './FragmentedUsername';
import { useScroll as useWarpScroll } from './ScrollContext';

// Set to '/resume.pdf' (once added to public/) or an external hosted CV link
const RESUME_URL = '';
const CONTACT_EMAIL = 'prasun.oct27@gmail.com';

const Hero = () => {
  const { triggerWarp } = useWarpScroll();

  // Ultra-smooth spring physics: velvety 120fps motion without any mouse-wheel stutter or drag lag
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 140,
    damping: 26,
    mass: 0.16,
    restDelta: 0.001
  });

  // Peripheral HUD elements smoothly fade out as user scrolls down
  const hudOpacity = useTransform(smoothScrollY, [0, 220], [1, 0]);
  const hudY = useTransform(smoothScrollY, [0, 220], [0, -30]);

  // Scroll indicator disappears quickly as soon as scrolling initiates
  const indicatorOpacity = useTransform(smoothScrollY, [0, 90], [1, 0]);

  const handleWarpNavigation = (e, sectionId) => {
    e.preventDefault();
    triggerWarp(sectionId);
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center relative overflow-visible"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col items-center overflow-visible">
        {/* Render above-the-fold Hero elements at immediate opacity: 1 so LCP paints on first frame */}
        <motion.div
          style={{ opacity: hudOpacity, y: hudY }}
          className="mb-6 text-target font-mono text-[clamp(0.75rem,2.2vw,1rem)] md:text-base tracking-[0.4em] uppercase text-center font-semibold"
        >
          SYSTEM.INITIALIZE // PORTFOLIO_V2.0
        </motion.div>

        <div className="relative w-full flex flex-col items-center justify-center overflow-visible">
          <div className="w-full flex justify-center overflow-visible">
            <FragmentedUsername scrollY={smoothScrollY} />
          </div>

          <motion.div
            style={{ opacity: hudOpacity }}
            className="mb-8 md:mb-10 flex items-center gap-1.5 sm:gap-3 text-phosphor font-heading tracking-[0.12em] sm:tracking-[0.26em] text-[clamp(0.82rem,3.5vw,1.65rem)] uppercase font-bold whitespace-nowrap"
          >
            <span className="text-target font-bold">[</span>
            <span>PRASUN KUMAR BISWAS</span>
            <span className="text-target font-bold">]</span>
          </motion.div>
        </div>

        <motion.p
          style={{ opacity: hudOpacity, y: hudY }}
          className="max-w-4xl mx-auto text-phosphor/95 text-[clamp(0.95rem,2.8vw,1.4rem)] md:text-2xl mb-10 md:mb-14 leading-relaxed font-mono tracking-wide font-medium"
        >
          AEROSPACE ENGINEER // FULL-STACK DEVELOPER // AI SYSTEMS ARCHITECT
          <span className="text-[clamp(0.75rem,2vw,1.05rem)] md:text-sm tracking-[0.28em] sm:tracking-[0.5em] text-sensor/90 mt-4 md:mt-6 block uppercase font-mono font-normal">
            BHUBANESWAR, ODISHA, INDIA // 20.2961° N, 85.8245° E
          </span>
        </motion.p>

        <motion.div
          style={{ opacity: hudOpacity }}
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 mb-12"
        >
          <a
            href="#projects"
            onClick={(e) => handleWarpNavigation(e, 'projects')}
            className="btn-hud bg-void/75 backdrop-blur-md text-lg md:text-xl px-12 py-5 group min-w-[240px]"
          >
            <span className="group-hover:tracking-[0.25em] transition-all duration-500 font-bold">ENGAGE OPTICS</span>
          </a>

          {RESUME_URL ? (
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              download="Prasun_Kumar_Biswas_CV.pdf"
              className="btn-hud bg-void/75 backdrop-blur-md text-lg md:text-xl px-12 py-5 !border-sensor/40 !text-phosphor group min-w-[240px] hover:!border-sensor hover:!text-sensor"
            >
              <span className="group-hover:tracking-[0.1em] transition-all duration-500 font-bold">SECURE_CV.PDF</span>
            </a>
          ) : (
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('CV / Resume Request — Prasun Kumar Biswas')}`}
              aria-label="Request CV via email"
              className="btn-hud bg-void/75 backdrop-blur-md text-lg md:text-xl px-12 py-5 !border-sensor/40 !text-phosphor group min-w-[240px] hover:!border-sensor hover:!text-sensor"
            >
              <span className="group-hover:tracking-[0.1em] transition-all duration-500 font-bold">REQUEST_CV</span>
            </a>
          )}
        </motion.div>

        {/* Scroll Down Indicator Animation (pure GPU CSS keyframes instead of infinite JS RAF) */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="flex flex-col items-center"
        >
          <a
            href="#about"
            onClick={(e) => handleWarpNavigation(e, 'about')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
            aria-label="Scroll to About section"
          >
            <span className="font-mono text-xs md:text-sm tracking-[0.35em] text-sensor/70 group-hover:text-sensor uppercase transition-colors font-semibold">
              SCROLL // TO ENGAGE
            </span>
            <div className="w-5 h-9 border-2 border-sensor/40 group-hover:border-sensor rounded-full flex justify-center p-1 transition-colors">
              <div className="w-1 h-2 bg-target rounded-full animate-scroll-dot" />
            </div>
            <div className="text-sensor/50 group-hover:text-sensor animate-scroll-chevron">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
