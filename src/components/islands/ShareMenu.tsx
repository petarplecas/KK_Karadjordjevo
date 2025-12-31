import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

interface ShareMenuProps {
  title: string;
  text: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export default function ShareMenu({ title, text, url, image, hashtags = [] }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Web Share API is supported
    setCanShare('share' in navigator);

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleWebShare = async () => {
    try {
      if ('share' in navigator) {
        const shareText = hashtags.length > 0
          ? `${text}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
          : text;

        const shareData: ShareData = {
          title,
          text: shareText,
          url,
        };

        // Try to include image if available
        if (image && 'canShare' in navigator) {
          try {
            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });

            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (err) {
            console.warn('Failed to fetch image for sharing:', err);
          }
        }

        await navigator.share(shareData);
        setIsOpen(false);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Main Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-2 px-4 py-2 glass border border-kk-border/30 hover:border-kk-accent text-kk-text-primary font-medium rounded-lg transition-all duration-300 hover:shadow-glow-amber"
        aria-label="Podeli"
      >
        <svg className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-kk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden sm:inline">Podeli</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass border border-kk-border/30 rounded-lg shadow-xl z-50 overflow-hidden animate-slideDown">
          <div className="py-2">
            {/* Web Share (Instagram + više) */}
            {canShare && (
              <button
                onClick={handleWebShare}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-kk-surface/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-kk-text-primary">Instagram & Više</div>
                  <div className="text-xs text-kk-text-secondary">Podeli sa slikom</div>
                </div>
              </button>
            )}

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-kk-surface/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-kk-text-primary">Facebook</div>
                <div className="text-xs text-kk-text-secondary">Podeli na Facebook-u</div>
              </div>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-kk-surface/50 transition-colors text-left border-t border-kk-border/30"
            >
              <div className="w-10 h-10 rounded-full bg-kk-border flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-kk-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-kk-text-primary">
                  {showCopied ? 'Link kopiran!' : 'Kopiraj link'}
                </div>
                <div className="text-xs text-kk-text-secondary">
                  {showCopied ? '✓ Možeš podeliti bilo gde' : 'Kopiraj URL u clipboard'}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
