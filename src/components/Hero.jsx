import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 text-target font-mono text-[clamp(0.6rem,2vw,0.875rem)] tracking-[0.4em] animate-pulse uppercase text-center"
        >
          SYSTEM.INITIALIZE // PORTFOLIO_V2.0
        </motion.div>

        <div className="relative w-full flex flex-col items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-heading text-[clamp(2.2rem,8.5vw,6rem)] mb-2 md:mb-3 tracking-[0.08em] sm:tracking-[0.15em] text-sensor drop-shadow-[0_0_25px_rgba(0,229,255,0.35)]"
          >
            <span className="text-target">0x</span>PRASUN
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 md:mb-8 flex items-center gap-2 sm:gap-3 text-phosphor/90 font-mono tracking-[0.2em] sm:tracking-[0.35em] text-[clamp(0.85rem,2.5vw,1.35rem)] uppercase font-semibold"
          >
            <span className="text-target font-bold">[</span>
            <span>PRASUN KUMAR BISWAS</span>
            <span className="text-target font-bold">]</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="max-w-4xl mx-auto text-phosphor/90 text-[clamp(0.75rem,2.5vw,1.15rem)] md:text-xl mb-8 md:mb-12 leading-relaxed font-mono tracking-wide"
        >
          AEROSPACE ENGINEER // FULL-STACK DEVELOPER // AI SYSTEMS ARCHITECT
          <span className="text-[clamp(0.6rem,1.5vw,0.85rem)] md:text-xs tracking-[0.3em] sm:tracking-[0.6em] text-sensor/80 mt-4 md:mt-6 block uppercase font-mono">
            LAT: 20.2961° N // LONG: 85.8245° E
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8"
        >
          <a href="#projects" className="btn-hud text-base md:text-lg px-10 py-4 group min-w-[220px]">
            <span className="group-hover:tracking-[0.25em] transition-all duration-500">ENGAGE OPTICS</span>
          </a>
          <a
            href="/resume.pdf"
            className="btn-hud text-base md:text-lg px-10 py-4 !border-sensor/40 !text-phosphor group min-w-[220px] hover:!border-sensor hover:!text-sensor"
          >
            <span className="group-hover:tracking-[0.1em] transition-all duration-500">SECURE_CV.PDF</span>
          </a>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;
