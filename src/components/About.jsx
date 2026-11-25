import { motion } from 'framer-motion';
import { Cpu, Plane, Code2 } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 group"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading flex flex-wrap items-center tracking-wide md:tracking-widest text-sensor">
            <span className="text-target mr-3 md:mr-4">01.</span> ABOUT ME
          </h2>
          <div className="h-px bg-sensor/20 w-full max-w-lg mt-4 transition-all group-hover:max-w-xl group-hover:bg-target/40"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-phosphor/95 text-xl md:text-2xl leading-relaxed"
          >
            <p>
              I am a multidisciplinary engineer studying at <span className="text-sensor font-semibold">Centurion University of Technology and Management (CUTM)</span>.
              My journey began with a fascination for flight and evolved into a deep dive into the systems that make autonomous and intelligent machines possible.
            </p>
            <p>
              My core philosophy centers around building from the ground up. Whether it's designing the physical airframe of a drone, soldering the flight controller, or deploying a local Large Language Model to process telemetry data, I thrive at the intersection of hardware and software.
            </p>
            <p className="text-white font-medium">
              I don't just write code; I engineer systems that interact with the physical world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="target-box p-6 bg-surface/40 rounded-none border border-sensor/20 transition-colors duration-300">
              <Plane className="text-target h-10 w-10 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 break-words">Aerospace</h3>
              <p className="text-base text-phosphor/90">Flight mechanics, 3D CAD modeling, and CFD simulations.</p>
            </div>
            <div className="target-box p-6 bg-surface/40 rounded-none border border-sensor/20 transition-colors duration-300">
              <Cpu className="text-target h-10 w-10 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 break-words">Hardware</h3>
              <p className="text-base text-phosphor/90">Embedded systems, custom drone builds, and circuit design.</p>
            </div>
            <div className="target-box p-6 bg-surface/40 rounded-none border border-sensor/20 transition-colors duration-300 sm:col-span-2">
              <Code2 className="text-target h-10 w-10 mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 break-words">Software & AI</h3>
              <p className="text-base text-phosphor/90">Full-stack web development and local LLM deployment (Ollama, Llama 3) for edge computing.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
