import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

const projectsData = [
  {
    id: 1,
    title: "Boeing Aeromodelling Competition",
    subtitle: "National Aerospace & Defence Innovation Sprint 2025-26",
    role: "Team Leader // Wingineers",
    venue: "KIIT Cricket Stadium, Campus-13, Bhubaneswar",
    dates: "18-19 March 2026",
    event: "BOEING NATIONAL SPRINT",
    organizer: "Boeing India & KIIT-DU",
    institution: "Centurion University of Technology and Management (CUTM)",
    category: "Aerospace",
    description: "Led Team Wingineers in the end-to-end aerodynamic design, structural prototyping, composite fabrication, and flight operations of a high-performance RC aircraft for the Boeing National Aeromodelling Competition. Represented Centurion University of Technology and Management (CUTM) at the national stage, optimizing wing loading, airfoil selection, and stability derivatives for mission success.",
    tags: [
      "Aerodynamics",
      "RC Aircraft",
      "Payload Optimization",
      "Structural Design",
      "CATIA V5",
      "Flight Telemetry",
      "Team Leadership"
    ],
    images: [
      {
        src: "/images/projects/boeing-wingineers.jpg",
        title: "Team Wingineers",
        caption: "Team Wingineers with the custom yellow & white RC aircraft and transmitter on the flight field.",
        shortLabel: "WINGINEERS",
        tag: "TEAM // WINGINEERS"
      },
      {
        src: "/images/projects/boeing-cutm-team.jpg",
        title: "CUTM Aerospace Contingent",
        caption: "The entire Aerospace team from CUTM that participated in the Boeing competition.",
        shortLabel: "CUTM TEAM",
        tag: "CUTM // CONTINGENT"
      },
      {
        src: "/images/projects/boeing-group.jpg",
        title: "Squad Celebration & Field Debrief",
        caption: "Post-flight crew celebration after completing competitive flight rounds.",
        shortLabel: "CELEBRATION",
        tag: "CREW // TELEMETRY"
      },
      {
        src: "/images/projects/boeing-banner.jpg",
        title: "Official Boeing Competition Arena",
        caption: "National Aeromodelling stage at KIIT Cricket Stadium featuring Indian Navy P-8I.",
        shortLabel: "ARENA BILLBOARD",
        tag: "EVENT // BRIEFING"
      }
    ],
    github: null,
    link: null
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const featuredProject = projectsData[0];

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="group">
            <h2 className="text-4xl md:text-5xl font-heading inline-flex items-center tracking-widest text-sensor">
              <span className="text-target mr-4">03.</span> ACTIVE_OPERATIONS
            </h2>
            <div className="h-px bg-sensor/20 w-full max-w-lg mt-4 transition-all group-hover:max-w-xl group-hover:bg-target/40"></div>
          </div>

          {/* Telemetry Status Indicator */}
          <div className="flex items-center gap-3 font-mono text-xs md:text-sm text-phosphor/80 bg-void/60 border border-sensor/30 px-4 py-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-target animate-pulse" />
            <span className="text-target font-bold">MISSION:</span>
            <span className="text-sensor font-semibold">FLAGSHIP_DEPLOYED</span>
            <span className="text-phosphor/40">|</span>
            <span>01 / 01 ACTIVE</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="pb-12"
        >
          <ProjectCard
            project={featuredProject}
            onOpenModal={() => setSelectedProject(featuredProject)}
          />
        </motion.div>

        <ProjectModal
          project={selectedProject}
          isOpen={selectedProject !== null}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
};

export default Projects;
