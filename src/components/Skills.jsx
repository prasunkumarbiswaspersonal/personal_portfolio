import { motion } from 'framer-motion';

const skills = [
  { category: "Hardware & Embedded", items: ["ESP32", "Arduino", "Drone Assembly", "Soldering", "Circuit Design", "Flight Controllers"] },
  { category: "Software Development", items: ["Python", "JavaScript/TypeScript", "React", "Node.js", "Express", "Firebase", "Git/GitHub"] },
  { category: "Engineering Tools", items: ["CATIA V5", "Ansys", "Fusion 360", "MATLAB"] },
  { category: "AI & Security", items: ["Local LLM Deployment", "Ollama", "Llama 3", "Network Diagnostics", "NIDS"] }
];

const Skills = () => {
  return (
    <section id="skills" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 group"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading flex flex-wrap items-center tracking-wide md:tracking-widest text-sensor">
            <span className="text-target mr-3 md:mr-4">02.</span> SKILLS ARSENAL
          </h2>
          <div className="h-px bg-sensor/20 w-full max-w-lg mt-4 transition-all group-hover:max-w-xl group-hover:bg-target/40"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skillGroup, index) => (
            <motion.div
              key={skillGroup.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="target-box p-6 bg-surface/40 rounded-none border border-sensor/20 transition-colors duration-300"
            >
              <h3 className="text-base md:text-lg font-bold text-white mb-4 border-b border-sensor/20 pb-2 break-words tracking-wide">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {skillGroup.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-void/50 text-sensor font-mono text-sm rounded-none border border-sensor/30 hover:border-target hover:text-white transition-colors duration-200 font-medium tracking-tight"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
