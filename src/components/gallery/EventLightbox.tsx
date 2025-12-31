import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import type { GalleryImage } from '../../types/gallery';
import ShareMenu from '../islands/ShareMenu';

interface EventLightboxProps {
  images: GalleryImage[];
  eventTitle: string;
  eventDate?: string;
}

export default function EventLightbox({ images, eventTitle, eventDate }: EventLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Listen for openLightbox custom event
  useEffect(() => {
    const handleOpenLightbox = (e: CustomEvent) => {
      const { index } = e.detail;
      setCurrentIndex(index);
      setIsOpen(true);
      setIsLoading(true);
      document.body.classList.add('lightbox-open');
    };

    window.addEventListener('openLightbox', handleOpenLightbox as EventListener);

    return () => {
      window.removeEventListener('openLightbox', handleOpenLightbox as EventListener);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex]);

  // Touch swipe support
  useEffect(() => {
    if (!isOpen) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        goToNext();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        goToPrevious();
      }
    };

    const element = document.getElementById('lightbox-overlay');
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isOpen, currentIndex]);

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.classList.remove('lightbox-open');
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoading(true);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoading(true);
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on children
    const target = e.target as HTMLElement;
    if (target.id === 'lightbox-overlay') {
      closeLightbox();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 z-10">
        <h2
          id="lightbox-title"
          className="text-lg sm:text-xl font-display font-bold text-white"
        >
          {eventTitle}
        </h2>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <div className="lightbox-share-menu">
            <ShareMenu
              title={`${eventTitle} - Slika ${currentIndex + 1}`}
              text={eventDate ? `${eventTitle} (${eventDate})` : eventTitle}
              url={typeof window !== 'undefined' ? window.location.href : ''}
              image={currentImage.fullPath}
              hashtags={['KKKaradjordjevo', 'Kosarka']}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="absolute left-2 sm:left-4 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {/* Main Image */}
          <img
            ref={imageRef}
            src={currentImage.fullPath}
            alt={currentImage.alt}
            className={`max-w-[95vw] max-h-[calc(100vh-180px)] w-auto h-auto object-contain rounded-lg shadow-2xl ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          disabled={currentIndex === images.length - 1}
          className="absolute right-2 sm:right-4 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
          aria-label="Next image"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Footer - Counter */}
      <div className="p-4 sm:p-6 text-center z-10">
        <p className="text-white text-sm sm:text-base font-semibold">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      <style>{`
        body.lightbox-open {
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in;
        }

        /* Style ShareMenu button for lightbox */
        .lightbox-share-menu > div > button {
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          padding: 0.5rem !important;
          border-radius: 9999px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          transition: all 0.2s !important;
        }

        .lightbox-share-menu > div > button:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.3) !important;
        }

        .lightbox-share-menu > div > button svg {
          width: 1.5rem !important;
          height: 1.5rem !important;
          color: white !important;
        }

        .lightbox-share-menu > div > button span {
          color: white !important;
        }

        /* Style dropdown menu for lightbox */
        .lightbox-share-menu div[class*="absolute"] {
          background-color: rgba(0, 0, 0, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          z-index: 10000 !important;
        }

        .lightbox-share-menu div[class*="absolute"] button {
          background-color: transparent !important;
          color: white !important;
        }

        .lightbox-share-menu div[class*="absolute"] button:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .lightbox-share-menu div[class*="absolute"] .font-semibold {
          color: white !important;
        }

        .lightbox-share-menu div[class*="absolute"] .text-xs {
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>
    </div>
  );
}
