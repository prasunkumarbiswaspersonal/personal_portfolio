import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { lockScroll, unlockScroll } from './scrollLock';

const ImageLightbox = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange
}) => {
  const currentImage = images[currentIndex] || images[0];
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Lock background scroll & restore focus on open/close
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

  // Separate effect for keyboard navigation & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        if (onIndexChange) {
          onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
        }
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        if (onIndexChange) {
          onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
        }
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
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (onIndexChange && images.length > 1) {
      onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (onIndexChange && images.length > 1) {
      onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overscroll-contain select-none"
          onClick={onClose}
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div
            ref={dialogRef}
            key="lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-dialog-title"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl w-full bg-[#030914] border border-sensor/50 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col hud-frame overflow-hidden overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar INSIDE the Pop-up with Title & Close Button */}
            <div className="bg-[#020610] px-4 sm:px-6 py-3 border-b border-sensor/25 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-target animate-pulse flex-shrink-0" />
                <span className="font-mono text-xs sm:text-sm text-sensor uppercase tracking-wider font-bold truncate">
                  {currentImage.tag || `ASSET_0${currentIndex + 1}/0${images.length}`} // {currentImage.title}
                </span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-1.5 bg-void text-phosphor hover:text-target border border-sensor/30 hover:border-target transition-colors flex-shrink-0 flex items-center justify-center"
                aria-label="Close image popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Display Area with Nav Controls & Smooth Image Crossfade */}
            <div className="relative h-[68vh] flex items-center justify-center bg-black/95 overflow-hidden p-2 sm:p-4 select-none">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage.src}
                  src={currentImage.src}
                  alt={currentImage.title}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="max-h-[66vh] w-auto max-w-full object-contain"
                />
              </AnimatePresence>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-void/85 text-sensor hover:text-target border border-sensor/40 hover:border-target transition-all hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-void/85 text-sensor hover:text-target border border-sensor/40 hover:border-target transition-all hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Caption Footer */}
            <div className="p-4 bg-[#020610] border-t border-sensor/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p id="lightbox-dialog-title" className="text-sm sm:text-base font-mono text-white font-bold mb-0.5">
                  {currentImage.title}
                </p>
                <p className="text-xs sm:text-sm font-mono text-phosphor/85 leading-relaxed">
                  {currentImage.caption || currentImage.desc}
                </p>
              </div>
              <div className="font-mono text-xs text-sensor/70 flex-shrink-0 sm:text-right">
                {currentIndex + 1} OF {images.length}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ImageLightbox;
