import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, MapPin, Award, CheckCircle2, Users } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import { lockScroll, unlockScroll } from './scrollLock';
import { useScroll } from './ScrollContext';

const BOEING_DETAILS = {
  title: "Boeing National Aeromodelling Competition",
  subtitle: "National Aerospace & Defence Innovation Sprint 2025-26",
  role: "Team Leader // Wingineers",
  venue: "KIIT Cricket Stadium, Campus-13, Bhubaneswar",
  dates: "18-19 March 2026",
  organizer: "Boeing India & KIIT-DU",
  institution: "Centurion University of Technology and Management (CUTM)",
  description: "Led Team Wingineers in designing, manufacturing, and piloting a competitive fixed-wing RC aircraft for the Boeing National Aeromodelling Competition. Represented Centurion University of Technology and Management (CUTM) in a national-level aerospace challenge, optimizing payload fraction, structural load distribution, and flight stability under tournament conditions.",
  fullDescription: "As the team leader of Wingineers, I spearheaded the aerodynamic design, structural engineering, and flight operations of our custom RC aircraft for the Boeing National Aeromodelling Competition held at KIIT Cricket Stadium, Bhubaneswar. From airfoil selection and CATIA 3D modeling to laser fabrication, motor thrust calibration, and real-time transmitter telemetry, our team engineered the aircraft from the ground up to achieve maximum flight efficiency.",
  challenges: [
    "Designing an optimized high-lift wing profile that maximized payload capability while maintaining minimal parasite drag",
    "Ensuring lightweight structural rigidity using balsa and composite materials to withstand high G-forces during turn maneuvers",
    "Calibrating power distribution, motor thrust-to-weight ratio, and flight controller trims for stability under outdoor wind conditions",
    "Coordinating team workflows across CAD modeling, laser fabrication, assembly, and piloting within strict competition timelines"
  ],
  images: [
    {
      src: "/images/projects/boeing-wingineers.webp",
      title: "Team Wingineers",
      desc: "Team Wingineers with the custom yellow & white RC competition aircraft and transmitter on the flight field.",
      tag: "TEAM // WINGINEERS"
    },
    {
      src: "/images/projects/boeing-cutm-team.webp",
      title: "CUTM Aerospace Team (Full Contingent)",
      desc: "The entire Aerospace delegation from Centurion University of Technology and Management (CUTM) that participated in the Boeing competition.",
      tag: "CUTM // CONTINGENT"
    },
    {
      src: "/images/projects/boeing-group.webp",
      title: "Squad Celebration & Field Debrief",
      desc: "Post-flight crew celebration after completing competitive flight rounds on the field.",
      tag: "CREW // TELEMETRY"
    },
    {
      src: "/images/projects/boeing-banner.webp",
      title: "Official Boeing Competition Arena",
      desc: "National Aeromodelling stage at KIIT Cricket Stadium featuring Indian Navy P-8I maritime patrol aircraft.",
      tag: "EVENT // BRIEFING"
    }
  ],
  technologies: [
    "Aerodynamics",
    "RC Aircraft",
    "CATIA V5",
    "Payload Optimization",
    "Structural Design",
    "Team Leadership",
    "Field Telemetry",
    "Avionics"
  ],
  outcome: "Successfully qualified and represented CUTM at the Boeing National Aeromodelling Competition, demonstrating high payload fraction, flight stability, and tactical piloting skills."
};

const ProjectModal = ({ project, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const { triggerWarp } = useScroll();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleClose = useCallback(() => {
    setSelectedImageIndex(null);
    onClose();
  }, [onClose]);

  const handleNavigateContact = (e) => {
    e.preventDefault();
    handleClose();
    // Wait for modal close & scroll unlock cleanup before triggering warp scroll
    setTimeout(() => {
      triggerWarp('contact');
    }, 60);
  };

  // Lock background scroll & restore focus cleanly when ProjectModal opens/closes
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    lockScroll();

    const focusTimer = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(focusTimer);
      unlockScroll();
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard navigation & focus trap (yields to ImageLightbox when open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (selectedImageIndex !== null) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedImageIndex, handleClose]);

  if (!project) return null;
  const details = BOEING_DETAILS;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overscroll-contain"
          onClick={handleClose}
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#030914] border border-sensor/40 rounded-none max-w-5xl w-full max-h-[92vh] overflow-y-auto overscroll-contain shadow-[0_0_40px_rgba(0,229,255,0.15)] relative hud-frame"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-30 bg-[#030914]/95 backdrop-blur-md px-6 py-4 border-b border-sensor/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-target animate-pulse" />
                <span className="font-mono text-xs md:text-sm text-sensor tracking-widest uppercase font-bold">
                  TELEMETRY_LOG // OPERATION: BOEING_AEROMODELLING
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="p-1.5 bg-void text-phosphor hover:text-target border border-sensor/30 hover:border-target transition-colors"
                aria-label="Close telemetry modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* Title & Metadata Banner */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase bg-target/20 text-rose-100 border border-target/70 font-bold">
                    <Award className="w-4 h-4 text-target" />
                    BOEING NATIONAL AEROMODELLING COMPETITION 2025-26
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-sensor bg-sensor/5 px-3 py-1 border border-sensor/30">
                    <MapPin className="w-3.5 h-3.5 text-sensor" />
                    {details.venue}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-phosphor/80 bg-void px-3 py-1 border border-sensor/20">
                    <Calendar className="w-3.5 h-3.5 text-target" />
                    {details.dates}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-white/90 bg-void px-3 py-1 border border-target/40">
                    <Users className="w-3.5 h-3.5 text-target" />
                    CUTM Aerospace
                  </span>
                </div>

                <h2 id="project-modal-title" className="text-3xl md:text-4xl font-heading text-white mb-2 tracking-wide">
                  {details.title.toUpperCase()}
                </h2>
                <h3 className="text-lg md:text-xl text-sensor font-mono mb-4 tracking-wider">
                  {details.role} &mdash; <span className="text-white/80">{details.institution}</span>
                </h3>
                <p className="text-phosphor/95 text-base md:text-lg leading-relaxed border-l-2 border-sensor/40 pl-4 py-1">
                  {details.description}
                </p>
              </div>

              {/* Grid: Project Overview & Key Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-5 bg-void/60 border border-sensor/20">
                  <h4 className="text-base font-bold font-mono text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-target">▸</span> Mission Overview
                  </h4>
                  <p className="text-phosphor/90 text-sm md:text-base leading-relaxed mb-6 font-normal">
                    {details.fullDescription}
                  </p>

                  <h4 className="text-base font-bold font-mono text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-target">▸</span> Technical Challenges
                  </h4>
                  <ul className="space-y-3">
                    {details.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="text-target text-sm mt-0.5 font-mono">0{index + 1}.</span>
                        <span className="text-phosphor/90 text-xs md:text-sm leading-relaxed">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-between p-5 bg-void/60 border border-sensor/20">
                  <div>
                    <h4 className="text-base font-bold font-mono text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-target">▸</span> Core Disciplines & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {details.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-sensor/5 text-sensor font-mono text-xs border border-sensor/30 uppercase tracking-tight"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-sensor/20">
                    <h4 className="text-base font-bold font-mono text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sensor" /> Mission Outcome
                    </h4>
                    <p className="text-phosphor/90 text-sm md:text-base leading-relaxed mb-4">
                      {details.outcome}
                    </p>
                    <div className="p-3 bg-sensor/10 border border-sensor/30 font-mono text-xs text-sensor">
                      ORGANIZED BY: Boeing India & KIIT Deemed to be University, Bhubaneswar
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Gallery - Real Competition Photos */}
              <div className="border-t border-sensor/20 pt-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <span className="text-target">▸</span> FIELD GALLERY & TELEMETRY PHOTOGRAPHS
                  </h4>
                  <span className="font-mono text-xs text-sensor/70 uppercase tracking-widest">
                    4 ASSETS LOGGED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {details.images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      className="group relative border border-sensor/20 hover:border-sensor/60 bg-void/80 overflow-hidden transition-all text-left w-full"
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Inspect photo ${index + 1}: ${image.title}`}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-void relative">
                        <img
                          src={image.src}
                          alt={image.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-void/90 text-[10px] font-mono text-sensor border border-sensor/30 font-bold">
                          {image.tag}
                        </div>
                      </div>
                      <div className="p-3.5 bg-void/95 border-t border-sensor/15">
                        <h5 className="text-sm font-mono font-bold text-white mb-1 group-hover:text-target transition-colors">
                          {image.title}
                        </h5>
                        <p className="text-xs font-mono text-phosphor/80 line-clamp-2">
                          {image.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Full-Screen Image Lightbox */}
              <ImageLightbox
                isOpen={selectedImageIndex !== null}
                onClose={() => setSelectedImageIndex(null)}
                images={details.images}
                currentIndex={selectedImageIndex ?? 0}
                onIndexChange={setSelectedImageIndex}
              />

              {/* Modal Footer */}
              <div className="border-t border-sensor/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <a
                  href="#contact"
                  onClick={handleNavigateContact}
                  className="btn-hud inline-flex items-center gap-2 text-sm md:text-base px-6 py-2.5 font-bold"
                >
                  <ExternalLink className="h-4 w-4" />
                  DISCUSS AEROSPACE COLLABORATIONS
                </a>
                <p className="text-xs text-phosphor/70 font-mono">
                  DIRECT CONTACT: <a href="mailto:prasun.oct27@gmail.com" className="text-target hover:underline">prasun.oct27@gmail.com</a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProjectModal;
