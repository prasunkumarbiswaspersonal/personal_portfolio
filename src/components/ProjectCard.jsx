import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, ArrowUpRight, Plane, Calendar, MapPin, Award } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

const ProjectCard = ({ project, onOpenModal }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const images = project.images || [];
  const currentImage = images[activeImageIndex] || images[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleOpenImage = (e) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className="hud-frame liquid-glass p-6 md:p-8 rounded-none border border-sensor/30 hover:border-sensor/60 transition-colors flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Left: Interactive Multi-Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Main Image Container */}
          <div
            className="relative aspect-[16/10] overflow-hidden border border-sensor/30 group bg-void/80"
          >
            {/* Clickable backdrop trigger for expanding active photo */}
            <button
              type="button"
              onClick={handleOpenImage}
              aria-label={`Expand ${currentImage?.title || project.title} in full mode`}
              className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sensor"
            />

            {/* Scanline & refraction HUD overlay */}
            <div className="absolute inset-0 bg-sensor/5 group-hover:bg-target/5 transition-colors duration-500 z-10 pointer-events-none" />

            {/* Current Active Image with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage?.src || activeImageIndex}
                src={currentImage?.src}
                alt={currentImage?.title || project.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />
            </AnimatePresence>

            {/* Top HUD Badges */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
              <span className="font-mono text-xs bg-void/90 text-sensor border border-sensor/40 px-2.5 py-1 tracking-wider uppercase font-semibold">
                {currentImage?.tag || `IMG_0${activeImageIndex + 1}/0${images.length}`}
              </span>
            </div>

            {/* Direct Expand Button for Image Full Mode */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={handleOpenImage}
                className="p-1.5 bg-void/90 text-phosphor hover:text-target border border-sensor/30 hover:border-target transition-colors flex items-center gap-1 font-mono text-[11px]"
                aria-label="Directly expand image in full mode"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">FULL MODE</span>
              </button>
            </div>

            {/* Navigation Arrows (always visible on mobile touch, hover-reveal on md+) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-void/85 text-sensor hover:text-target border border-sensor/30 hover:border-target transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-void/85 text-sensor hover:text-target border border-sensor/30 hover:border-target transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-void via-void/85 to-transparent p-3 pt-8 z-20 flex justify-between items-end gap-2 pointer-events-none">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-mono text-white font-bold truncate">
                  {currentImage?.title}
                </p>
                <p className="text-[11px] font-mono text-phosphor/80 truncate">
                  {currentImage?.caption}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenImage}
                className="pointer-events-auto text-[10px] font-mono text-target hover:text-sensor uppercase tracking-widest flex-shrink-0 font-bold transition-colors"
              >
                EXPAND IMAGE ↗
              </button>
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="grid grid-cols-4 gap-2.5 mt-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                aria-pressed={activeImageIndex === idx}
                className={`relative aspect-[16/10] overflow-hidden border transition-all duration-300 text-left ${
                  activeImageIndex === idx
                    ? 'border-target shadow-[0_0_12px_rgba(255,0,60,0.6)] scale-[1.03]'
                    : 'border-sensor/30 opacity-60 hover:opacity-100 hover:border-sensor hover:scale-[1.01]'
                }`}
                aria-label={`Select image ${idx + 1}: ${img.title}`}
              >
                <img
                  src={img.src}
                  alt={img.title || `Thumbnail ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-[center_30%]"
                />
                <div className="absolute bottom-0 inset-x-0 bg-void/85 px-1 py-0.5 flex justify-between items-center text-[9px] font-mono">
                  <span className="text-target font-bold">0{idx + 1}</span>
                  <span className="text-white truncate text-[8px] pl-1 font-semibold">{img.shortLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Project Telemetry & Specifications */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div>
            {/* Mission Subtitle & Venue */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase bg-target/20 text-rose-100 border border-target/70 font-bold tracking-wider">
                <Award className="w-3.5 h-3.5 text-target" />
                {project.event || 'BOEING NATIONAL SPRINT'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-sensor/90">
                <MapPin className="w-3 h-3 text-sensor" />
                {project.venue || 'KIIT Cricket Stadium, BBSR'}
              </span>
            </div>

            {/* Project Title */}
            <div className="flex justify-between items-start gap-4 mb-3">
              <h3 className="font-heading text-xl sm:text-2xl md:text-3xl text-white tracking-wider break-words">
                {project.title.toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={onOpenModal}
                className="p-1.5 hover:text-target text-sensor border border-transparent hover:border-target/40 transition-colors flex-shrink-0 mt-1"
                aria-label="Open detailed mission log"
              >
                <ArrowUpRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm font-mono text-sensor font-medium mb-4 tracking-wide">
              <span className="text-rose-400 font-bold">[LEADERSHIP]</span>
              <span>{project.role}</span>
              <span className="text-phosphor/40">|</span>
              <span className="text-phosphor/80">CUTM Aerospace</span>
            </div>

            <p className="text-phosphor/95 text-base md:text-lg mb-6 leading-relaxed font-normal">
              {project.description}
            </p>

            {/* Tactical Specs HUD Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-void/60 border border-sensor/20">
                <span className="block text-[11px] font-mono text-sensor/70 uppercase tracking-widest mb-1">
                  PLATFORM
                </span>
                <span className="text-sm font-mono text-white font-semibold flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-target" /> Fixed-Wing RC Aircraft
                </span>
              </div>
              <div className="p-3 bg-void/60 border border-sensor/20">
                <span className="block text-[11px] font-mono text-sensor/70 uppercase tracking-widest mb-1">
                  COMPETITION
                </span>
                <span className="text-sm font-mono text-white font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-target" /> March 18-19, 2026
                </span>
              </div>
              <div className="p-3 bg-void/60 border border-sensor/20">
                <span className="block text-[11px] font-mono text-sensor/70 uppercase tracking-widest mb-1">
                  ORGANIZERS
                </span>
                <span className="text-sm font-mono text-white font-semibold">
                  Boeing India & KIIT-DU
                </span>
              </div>
              <div className="p-3 bg-void/60 border border-sensor/20">
                <span className="block text-[11px] font-mono text-sensor/70 uppercase tracking-widest mb-1">
                  INSTITUTION
                </span>
                <span className="text-sm font-mono text-white font-semibold truncate" title="Centurion University of Technology and Management (CUTM)">
                  CUTM Aerospace
                </span>
              </div>
            </div>

            {/* Technical Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs md:text-sm border border-sensor/30 text-sensor bg-sensor/5 font-mono uppercase tracking-tight font-medium"
                >
                  {tag.replace(/\s+/g, '_')}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-sensor/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={onOpenModal}
              className="btn-hud w-full sm:w-auto px-6 py-3 text-sm md:text-base font-bold flex items-center justify-center gap-2 group/btn"
            >
              <span>INSPECT MISSION LOG & SPECS</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
            </button>

            <span className="font-mono text-xs text-sensor/70 tracking-widest uppercase">
              STATUS: QUALIFIED // TOURNAMENT RUN
            </span>
          </div>
        </div>
      </div>

      {/* Direct Full-Screen Image Lightbox */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        currentIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
      />
    </>
  );
};

export default ProjectCard;
