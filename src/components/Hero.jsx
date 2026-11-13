import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import FragmentedUsername from './FragmentedUsername';

const Hero = () => {
  // Ultra-responsive spring physics: zero input delay with silky 120fps micro-smoothing
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 280,
    damping: 32,
    mass: 0.08,
    restDelta: 0.001
  });

  // Peripheral HUD elements smoothly fade out as user scrolls down
  const hudOpacity = useTransform(smoothScrollY, [0, 220], [1, 0]);
  const hudY = useTransform(smoothScrollY, [0, 220], [0, -30]);

  // Scroll indicator disappears quickly as soon as scrolling initiates
  const indicatorOpacity = useTransform(smoothScrollY, [0, 90], [1, 0]);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center relative overflow-visible"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col items-center overflow-visible">
        <motion.div
          style={{ opacity: hudOpacity, y: hudY }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 text-target font-mono text-[clamp(0.75rem,2.2vw,1rem)] md:text-base tracking-[0.4em] animate-pulse uppercase text-center font-semibold"
        >
          SYSTEM.INITIALIZE // PORTFOLIO_V2.0
        </motion.div>

        <div className="relative w-full flex flex-col items-center justify-center overflow-visible">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full flex justify-center overflow-visible"
          >
            <FragmentedUsername scrollY={smoothScrollY} />
          </motion.div>

          <motion.div
            style={{ opacity: hudOpacity }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 md:mb-10 flex items-center gap-2 sm:gap-3 text-phosphor font-mono tracking-[0.25em] sm:tracking-[0.4em] text-[clamp(1.1rem,3.2vw,1.8rem)] uppercase font-bold"
          >
            <span className="text-target font-bold">[</span>
            <span>PRASUN KUMAR BISWAS</span>
            <span className="text-target font-bold">]</span>
          </motion.div>
        </div>

        <motion.p
          style={{ opacity: hudOpacity, y: hudY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-4xl mx-auto text-phosphor/95 text-[clamp(0.95rem,2.8vw,1.4rem)] md:text-2xl mb-10 md:mb-14 leading-relaxed font-mono tracking-wide font-medium"
        >
          AEROSPACE ENGINEER // FULL-STACK DEVELOPER // AI SYSTEMS ARCHITECT
          <span className="text-[clamp(0.75rem,2vw,1.05rem)] md:text-sm tracking-[0.35em] sm:tracking-[0.6em] text-sensor/90 mt-4 md:mt-6 block uppercase font-mono font-normal">
            LAT: 20.2961° N // LONG: 85.8245° E
          </span>
        </motion.p>

        <motion.div
          style={{ opacity: hudOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 mb-12"
        >
          <a href="#projects" className="btn-hud text-lg md:text-xl px-12 py-5 group min-w-[240px]">
            <span className="group-hover:tracking-[0.25em] transition-all duration-500 font-bold">ENGAGE OPTICS</span>
          </a>
          <a
            href="/resume.pdf"
            className="btn-hud text-lg md:text-xl px-12 py-5 !border-sensor/40 !text-phosphor group min-w-[240px] hover:!border-sensor hover:!text-sensor"
          >
            <span className="group-hover:tracking-[0.1em] transition-all duration-500 font-bold">SECURE_CV.PDF</span>
          </a>
        </motion.div>

        {/* Scroll Down Indicator Animation */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col items-center"
        >
          <a
            href="#about"
            className="flex flex-col items-center gap-2 group cursor-pointer"
            aria-label="Scroll to About section"
          >
            <span className="font-mono text-xs md:text-sm tracking-[0.35em] text-sensor/70 group-hover:text-sensor uppercase transition-colors font-semibold">
              SCROLL // TO ENGAGE
            </span>
            <div className="w-5 h-9 border-2 border-sensor/40 group-hover:border-sensor rounded-full flex justify-center p-1 transition-colors">
              <motion.div
                animate={{
                  y: [0, 14, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 h-2 bg-target rounded-full"
              />
            </div>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-sensor/50 group-hover:text-sensor"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
