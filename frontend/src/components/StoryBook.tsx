import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageFlip } from 'page-flip';
import { Story } from '../types';
import StoryText from './StoryText';
import ImageDisplay from './ImageDisplay';
import { Play, Pause, FileText, X, ChevronLeft, ChevronRight, Download, Link } from 'lucide-react';
import { storiesApi, notesApi, ttsApi } from '../services/api';
import { shareService } from '../services/shareService';
import { pdfService } from '../services/pdfService';
import { translationService, LanguageCode } from '../services/translationService';
import AIAssistant from './AIAssistant';
import toast from 'react-hot-toast';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-23.1-115-65-157zM223.9 416.3c-33.1 0-65.5-8.9-94-25.7l-6.7-4-69.8 18.3L72 336.8l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.1 0-103.7 84.4-188 188.1-188 50.2 0 97.4 19.6 133 55.1 35.5 35.6 55.1 82.8 55.1 133.1-.1 103.7-84.5 188-188.1 188zM327.9 283.2c-5.7-2.9-33.9-16.7-39.2-18.6-5.3-1.9-9.1-2.9-12.9 2.9-3.8 5.7-14.8 18.6-18.2 22.4-3.3 3.8-6.7 4.3-12.4 1.4-5.7-2.9-24.1-8.9-46-28.6-17-15.3-28.4-34.2-31.8-39.9-3.3-5.7-.4-8.8 2.5-11.7 2.6-2.6 5.7-6.7 8.6-10 2.9-3.3 3.8-5.7 5.7-9.5 1.9-3.8.9-7.1-.5-10-1.4-2.9-12.9-31.1-17.7-42.6-4.6-11.2-9.4-9.7-12.9-9.9-3.3-.2-7.1-.2-11-.2-3.8 0-10 1.4-15.3 7.1-5.3 5.7-20.1 19.7-20.1 47.9s20.6 55.5 23.4 59.3c2.9 3.8 40.5 61.8 98.1 86.6 13.7 5.9 24.4 9.4 32.8 12.1 13.8 4.4 26.4 3.8 36.3 2.3 11.2-1.7 33.9-13.8 38.7-27.2 4.8-13.3 4.8-24.8 3.3-27.2-1.5-2.6-5.3-4-11-6.9z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
  </svg>
);


interface StoryBookProps {
  story: Story;
  onStoryEnd: () => void;
  onStoryUpdate?: (story: Story) => void;
}

// Decorative corner ornament SVG component
const CornerOrnament: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const rotations: Record<string, string> = {
    'top-left': 'rotate(0deg)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  };

  const positions: Record<string, React.CSSProperties> = {
    'top-left': { top: 8, left: 8 },
    'top-right': { top: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
  };

  return (
    <div
      className="absolute w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 pointer-events-none z-10"
      style={{ ...positions[position], transform: rotations[position] }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ fill: '#3d3225' }}>
        <path d="M5,5 Q5,25 15,35 Q5,35 5,55 M5,5 Q25,5 35,15 Q35,5 55,5"
          stroke="#3d3225"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round" />
        <circle cx="5" cy="5" r="3" fill="#3d3225" />
        <path d="M20,20 Q25,15 30,20 Q35,25 30,30 Q25,35 20,30 Q15,25 20,20" fill="#3d3225" opacity="0.6" />
      </svg>
    </div>
  );
};

const StoryBook: React.FC<StoryBookProps> = ({ story, onStoryEnd, onStoryUpdate }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [localStory, setLocalStory] = useState<Story>(story);
  const [translatedText, setTranslatedText] = useState<{ [key: number]: string }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('aura-asteria-en');
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [bookReady, setBookReady] = useState(false);

  const bookRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevTextRef = useRef<string | null>(null);
  const prevVoiceRef = useRef<string | null>(null);

  // Initialize speech synthesis and load voices (Removed in favor of Deepgram)

  // Load shareable link on mount
  useEffect(() => {
    const loadShareableLink = async () => {
      if (localStory.id) {
        try {
          const shareData = await storiesApi.getShareableLink(localStory.id);
          if (shareData && shareData.shareableLink) {
            setShareableLink(shareData.shareableLink);
          }
        } catch (error) {
          console.error('Error loading shareable link:', error);
        }
      }
    };
    loadShareableLink();
  }, [localStory.id]);

  // Update local story when prop changes
  useEffect(() => {
    setLocalStory(story);
  }, [story]);

  // Cleanup audio on unmount or page change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentPage]);

  // Initialize PageFlip
  useEffect(() => {
    if (bookRef.current && !pageFlipRef.current && localStory.pages.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (bookRef.current) {
          const pageFlip = new PageFlip(bookRef.current, {
            width: 550,
            height: 650,
            size: 'stretch',
            minWidth: 300,
            maxWidth: 700,
            minHeight: 400,
            maxHeight: 800,
            showCover: false,
            maxShadowOpacity: 0.5,
            mobileScrollSupport: false,
            useMouseEvents: false,
            swipeDistance: 30,
            clickEventForward: true,
            usePortrait: false,
            startZIndex: 0,
            autoSize: true,
            drawShadow: true,
            flippingTime: 800,
            startPage: 0,
            showPageCorners: true,
          });

          const pages = bookRef.current.querySelectorAll('.page');
          if (pages.length > 0) {
            pageFlip.loadFromHTML(pages as NodeListOf<HTMLElement>);

            pageFlip.on('flip', (e: any) => {
              const newPage = Math.floor(e.data / 2);
              setCurrentPage(newPage);
              stopReading();
            });

            pageFlipRef.current = pageFlip;
            setBookReady(true);
          }
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (pageFlipRef.current) {
          pageFlipRef.current.destroy();
          pageFlipRef.current = null;
        }
      };
    }
  }, [localStory.pages.length]);

  // Handle translation when language changes
  useEffect(() => {
    const performTranslation = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedText({});
        return;
      }

      setIsTranslating(true);
      toast.loading('Translating...', { id: 'translate' });
      try {
        const texts = localStory.pages.map(p => p.text);
        const translations = await translationService.translateBatch(texts, 'en', selectedLanguage);
        const newTranslatedText: { [key: number]: string } = {};
        localStory.pages.forEach((page, idx) => {
          const pageNum = page.pageNumber || idx + 1;
          newTranslatedText[pageNum] = translations[idx];
        });
        setTranslatedText(newTranslatedText);
        toast.success('Translation complete!', { id: 'translate' });
      } catch (error) {
        console.error('Translation error:', error);
        toast.error('Failed to translate text. Please try again.', { id: 'translate' });
        setTranslatedText({});
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [selectedLanguage, localStory]);

  const handleNext = useCallback(() => {
    stopReading();

    // Check if we're on the last page
    if (currentPage >= localStory.pages.length - 1) {
      onStoryEnd();
      return;
    }

    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext();
    } else {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, localStory.pages.length, onStoryEnd]);


  const handlePrevious = useCallback(() => {
    stopReading();
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev();
    } else if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const getTextToRead = (): string => {
    const currentPageData = localStory.pages[currentPage];
    const pageNum = currentPageData.pageNumber || currentPage + 1;
    return translatedText[pageNum] || currentPageData.text;
  };

  const playNextPage = async (pageIdx: number) => {
    if (pageIdx >= localStory.pages.length) {
      setIsReading(false);
      setIsPaused(false);
      onStoryEnd();
      return;
    }

    if (currentPage !== pageIdx) {
      if (pageFlipRef.current) {
        if (pageIdx === currentPage + 1) {
          pageFlipRef.current.flipNext();
        } else {
          pageFlipRef.current.flip(pageIdx * 2);
        }
      } else {
        setCurrentPage(pageIdx);
      }
    }

    // Wait for page turn animation before generating audio
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentPageData = localStory.pages[pageIdx];
    const pageNum = currentPageData.pageNumber || pageIdx + 1;
    const text = translatedText[pageNum] || currentPageData.text;

    try {
      const audioBlob = await ttsApi.speak(text, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      // audio.playbackRate = 0.9; // uncomment if still too fast
      audioRef.current = audio;

      audio.onended = () => {
        // Only flip page automatically if we're actively auto-reading
        if (!isPaused) {
          playNextPage(pageIdx + 1);
        }
      };

      audio.onerror = () => {
        toast.error('Error playing audio.', { id: 'tts' });
        setIsReading(false);
        setIsPaused(false);
      };

      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('Failed to generate audio.', { id: 'tts' });
      setIsReading(false);
      setIsPaused(false);
    }
  };

  const startReading = async () => {
    if (isTranslating) return;

    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPaused(false);
      return;
    }

    stopReading();
    setIsReading(true);
    setIsPaused(false);
    toast.success('Starting Story Read-Aloud', { id: 'tts' });

    // Start the recursive reading loop from current page
    playNextPage(currentPage);
  };

  const pauseReading = () => {
    if (audioRef.current && isReading) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(e => console.error(e));
      setIsPaused(false);
    }
  };

  const stopReading = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsReading(false);
      setIsPaused(false);
    }
  };

  const handleReadAloud = () => {
    if (isReading) {
      if (isPaused) {
        resumeReading();
      } else {
        pauseReading();
      }
    } else {
      startReading();
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsSavingNote(true);
    try {
      await notesApi.create({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        storyId: localStory.id,
        storyTitle: localStory.title,
        pageNumber: currentPage,
      });
      toast.success('Note saved successfully!');
      setShowNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error?.message || 'Failed to save note. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (isEditing) {
        if (e.key === 'Escape') {
          setIsEditing(false);
          setEditedText('');
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          handleReadAloud();
          break;
        case 'Escape':
          stopReading();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEditing, handleNext, handlePrevious]);

  const currentPageData = localStory.pages[currentPage] || localStory.pages[0];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === localStory.pages.length - 1;

  const handleShare = (type: 'whatsapp' | 'twitter' | 'pdf' | 'link') => {
    const url = shareableLink || window.location.href;
    switch (type) {
      case 'whatsapp':
        shareService.shareToWhatsApp({ title: localStory.title, text: `Check out this story: ${localStory.title}`, url });
        break;
      case 'twitter':
        shareService.shareToTwitter({ title: localStory.title, text: `Check out this story: ${localStory.title}`, url });
        break;
      case 'pdf':
        toast.loading('Generating PDF...', { id: 'pdf' });
        pdfService.generatePDF({ story: localStory })
          .then(() => {
            toast.success('PDF downloaded successfully!', { id: 'pdf' });
          })
          .catch(error => {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF', { id: 'pdf' });
          });
        break;
      case 'link':
        shareService.copyLink(url).then(copied => {
          if (copied) {
            toast.success('Link copied to clipboard!');
          } else {
            toast.error('Failed to copy link');
          }
        });
        break;
    }
  };

  // Vintage paper background style
  const vintagePageStyle: React.CSSProperties = {
    background: `
      linear-gradient(135deg, 
        #d4c4a8 0%, 
        #c9b896 15%, 
        #bfae85 30%, 
        #c4b48f 50%, 
        #d0c19a 70%, 
        #c9b896 85%, 
        #d4c4a8 100%
      )
    `,
    boxShadow: 'inset 0 0 80px rgba(139, 119, 85, 0.3)',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-2 sm:p-4 md:p-6"
      style={{
        background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #2c1810 100%)',
      }}
    >
      {/* Header Section */}
      <div className="w-full max-w-6xl mb-3 md:mb-6">
        <div className="text-center mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-100 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {localStory.title}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/70">Created By <span className="font-semibold">Tech Tales</span></p>
        </div>
        <div className="flex justify-center items-center gap-2 md:gap-3 flex-wrap">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const newLang = e.target.value as LanguageCode;
              setSelectedLanguage(newLang);
              stopReading();
            }}
            className="bg-amber-100/90 rounded-lg px-2 md:px-3 py-2 shadow-sm border border-amber-700 text-xs sm:text-sm text-amber-900 min-h-[44px]"
            disabled={isTranslating}
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="te">🇮🇳 Telugu</option>
          </select>
          {/* Voice Selector */}
          <select
            value={selectedVoice}
            onChange={(e) => {
              setSelectedVoice(e.target.value);
              stopReading();
            }}
            className="bg-amber-100/90 rounded-lg px-2 md:px-3 py-2 shadow-sm border border-amber-700 text-xs sm:text-sm text-amber-900 min-h-[44px]"
            disabled={isTranslating}
          >
            <option value="aura-asteria-en">Voice: Child (F) - Asteria</option>
            <option value="aura-athena-en">Voice: Adult (F) - Athena</option>
            <option value="aura-arcas-en">Voice: Adult (M) - Arcas</option>
            <option value="aura-orion-en">Voice: Adult (M) - Orion</option>
            <option value="aura-stella-en">Voice: Adult (F) - Stella</option>
          </select>
        </div>
      </div>

      {/* Book Container */}
      <div className="relative w-full max-w-6xl mb-4 md:mb-8">
        {/* Left Navigation Arrow */}
        {/* Left Navigation Arrow */}
        {!isFirstPage && (
          <button
            onClick={handlePrevious}
            className="absolute left-0 sm:-left-8 md:-left-16 lg:-left-32 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 hover:scale-110 z-30 min-w-[44px] min-h-[44px]"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* The Book */}
        <div
          ref={bookRef}
          className="mx-auto relative"
          style={{
            width: '100%',
            maxWidth: '1100px',
          }}
        >
          {/* Center Crease Effect */}
          <div className="book-crease" />

          {/* Book Thickness Effect - Left Side */}
          <div
            className="absolute top-2 bottom-3 left-1 w-4 z-0 rounded-l-md"
            style={{
              transform: 'translateX(-100%) skewY(0deg)',
              background: 'linear-gradient(to right, #8a7b5c 0%, #d4c4a8 20%, #8a7b5c 40%, #d4c4a8 60%, #8a7b5c 80%, #d4c4a8 100%)',
              boxShadow: '-2px 2px 5px rgba(0,0,0,0.3)',
              borderLeft: '1px solid #6d5e43'
            }}
          />

          {/* Book Thickness Effect - Right Side */}
          <div
            className="absolute top-2 bottom-3 right-1 w-4 z-0 rounded-r-md"
            style={{
              transform: 'translateX(100%) skewY(0deg)',
              background: 'linear-gradient(to left, #8a7b5c 0%, #d4c4a8 20%, #8a7b5c 40%, #d4c4a8 60%, #8a7b5c 80%, #d4c4a8 100%)',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
              borderRight: '1px solid #6d5e43'
            }}
          />

          {/* Generate pages for each story page - 2 HTML pages per story page (left: text, right: image) */}
          {localStory.pages.map((page, idx) => (
            <React.Fragment key={idx}>
              {/* Left Page - Story Text */}
              <div
                className="page relative overflow-hidden"
                style={vintagePageStyle}
              >
                {/* Inner shadow towards center */}
                <div className="page-inner-shadow-left" />

                {/* Corner Ornaments */}
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <CornerOrnament position="bottom-left" />
                <CornerOrnament position="bottom-right" />


                {/* Content Container */}
                <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col">
                  {/* Top Controls */}
                  <div className="flex justify-between items-start mb-4 z-20">
                    <div className="flex items-center gap-2">
                      {/* Read Aloud Button */}
                      <button
                        onClick={handleReadAloud}
                        className="flex items-center gap-1 sm:gap-2 bg-amber-800/80 hover:bg-amber-700 text-amber-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-md min-h-[44px]"
                        disabled={isTranslating || !selectedVoice}
                      >
                        {isReading && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isReading && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Read'}</span>
                      </button>
                    </div>

                    {/* Notes Button */}
                    <button
                      onClick={() => {
                        setNoteTitle('');
                        setNoteContent('');
                        setShowNoteModal(true);
                      }}
                      className="w-10 h-10 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-full flex items-center justify-center shadow-md transition-all min-w-[44px] min-h-[44px]"
                      title="Take a note"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Story Text */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {idx === currentPage ? (
                      isEditing ? (
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          className="w-full h-full p-3 bg-amber-50/50 border-2 border-amber-700 rounded-lg text-amber-900 text-sm sm:text-base leading-relaxed resize-none"
                          style={{ minHeight: '200px', fontFamily: 'Georgia, serif' }}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="text-amber-900 text-sm sm:text-base md:text-lg leading-relaxed"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          <StoryText
                            text={translatedText[page.pageNumber || idx + 1] || page.text}
                            pageNumber={idx + 1}
                          />
                        </div>
                      )
                    ) : (
                      <div
                        className="text-amber-900 text-sm sm:text-base md:text-lg leading-relaxed"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        <StoryText
                          text={translatedText[page.pageNumber || idx + 1] || page.text}
                          pageNumber={idx + 1}
                        />
                      </div>
                    )}
                  </div>

                  {/* Key Points Section */}
                  {page.keyPoints && page.keyPoints.length > 0 && (
                    <div
                      className="mt-3 p-3 rounded-lg border-l-4"
                      style={{
                        backgroundColor: 'rgba(107, 142, 35, 0.15)',
                        borderLeftColor: '#6B8E23',
                      }}
                    >
                      <h4 className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#556B2F' }}>
                        📚 Key Points
                      </h4>
                      <ul className="space-y-1">
                        {page.keyPoints.map((point, pidx) => (
                          <li
                            key={pidx}
                            className="text-xs sm:text-sm leading-relaxed flex items-start gap-2"
                            style={{ color: '#3B4F1E', fontFamily: 'Georgia, serif' }}
                          >
                            <span style={{ color: '#6B8E23' }}>•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Page Number */}
                  <div className="text-center mt-3 text-amber-800/70 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                    — {idx * 2 + 1} —
                  </div>
                </div>
              </div>

              {/* Right Page - Image */}
              <div
                className="page relative overflow-hidden"
                style={vintagePageStyle}
              >
                {/* Inner shadow towards center */}
                <div className="page-inner-shadow-right" />

                {/* Corner Ornaments */}
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <CornerOrnament position="bottom-left" />
                <CornerOrnament position="bottom-right" />

                {/* Content Container */}
                <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col">
                  {/* Image Container */}
                  <div className="flex-1 flex items-center justify-center">
                    <div
                      className="relative w-full h-full max-w-full max-h-full rounded-lg overflow-hidden"
                      style={{
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 3px rgba(139, 119, 85, 0.5)',
                        border: '4px solid #8b7755',
                      }}
                    >
                      {idx === currentPage && showImageUpload && selectedImageFile ? (
                        <img
                          src={URL.createObjectURL(selectedImageFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageDisplay
                          imageUrl={page.imageUrl}
                          alt={`${localStory.title} - Page ${idx + 1}`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Image Upload Controls - Only show for current page */}
                  {idx === currentPage && (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      <p className="text-sm text-amber-800 font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                        Select an image for this page
                      </p>
                      <div className="flex gap-3 items-center">
                        {/* Current Image Thumbnail */}
                        <button
                          onClick={() => {
                            setShowImageUpload(false);
                            setSelectedImageFile(null);
                          }}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-3 transition-all shadow-lg min-w-[56px] min-h-[56px] ${!showImageUpload ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-300 hover:border-amber-500'
                            }`}
                        >
                          {page.imageUrl ? (
                            <img
                              src={page.imageUrl}
                              alt="Current"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-amber-200 flex items-center justify-center">
                              <span className="text-amber-600 text-lg">📷</span>
                            </div>
                          )}
                        </button>

                        {/* Add New Image Button */}
                        <label
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-lg min-w-[56px] min-h-[56px] ${showImageUpload
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 border-3 border-orange-400 ring-2 ring-orange-300'
                            : 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 border-2 border-orange-300'
                            }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImageFile(file);
                                setShowImageUpload(true);
                              }
                            }}
                          />
                          <span className="text-white text-2xl font-bold">+</span>
                        </label>
                      </div>

                      {/* Upload/Cancel Buttons - Show when file is selected */}
                      {showImageUpload && selectedImageFile && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={async () => {
                              if (!selectedImageFile) return;
                              setIsUploadingImage(true);
                              try {
                                if (!localStory.id) {
                                  toast.error('Story ID is missing');
                                  setIsUploadingImage(false);
                                  return;
                                }
                                const response = await storiesApi.updatePageImage(localStory.id, currentPage + 1, selectedImageFile);
                                const updatedPages = [...localStory.pages];
                                updatedPages[currentPage].imageUrl = response.story.pages[currentPage].imageUrl;
                                const updatedStory = { ...localStory, pages: updatedPages };
                                setLocalStory(updatedStory);
                                if (onStoryUpdate) {
                                  onStoryUpdate(updatedStory);
                                }
                                setShowImageUpload(false);
                                setSelectedImageFile(null);
                                toast.success('Image uploaded successfully!');
                              } catch (error: any) {
                                console.error('Error uploading image:', error);
                                toast.error(error?.message || 'Failed to upload image');
                              } finally {
                                setIsUploadingImage(false);
                              }
                            }}
                            disabled={isUploadingImage}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs sm:text-sm font-semibold transition-all min-h-[44px] shadow-md"
                          >
                            {isUploadingImage ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            onClick={() => {
                              setShowImageUpload(false);
                              setSelectedImageFile(null);
                            }}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-xs sm:text-sm font-semibold transition-all min-h-[44px] shadow-md"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Page Number */}
                  <div className="text-center mt-2 text-amber-800/70 text-sm italic" style={{ fontFamily: 'Georgia, serif' }}>
                    — {idx * 2 + 2} —
                  </div>

                </div>
              </div>
            </React.Fragment>
          ))}
        </div>


        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-0 sm:-right-8 md:-right-16 lg:-right-32 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-200 hover:scale-110 z-30 min-w-[44px] min-h-[44px]"
          aria-label={isLastPage ? "Finish story" : "Next page"}
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Bottom Section - My Stories Button and Social Sharing */}
      <div className="w-full max-w-6xl mt-4">
        {/* My Stories Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate('/library')}
            className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            My Stories
          </button>
        </div>

        {/* Share Section */}
        <div className="text-center mb-4">
          <p className="text-lg text-amber-100 font-medium">
            Share your story with the world!
          </p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">

          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all"
          >
            <WhatsAppIcon className="w-6 h-6" />
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all"
          >
            <TwitterIcon className="w-6 h-6" />
          </button>

          {/* Download PDF */}
          <button
            onClick={() => handleShare('pdf')}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all"
          >
            <Download className="w-6 h-6" />
          </button>

          {/* Copy Link */}
          <button
            onClick={() => handleShare('link')}
            className="flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-full shadow-lg transition-all"
          >
            <Link className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant storyContext={{
        title: localStory.title,
        concept: localStory.concept,
        currentPage: currentPage,
        currentText: currentPageData?.text,
      }} />

      {/* Note Modal */}
      {showNoteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNoteModal(false);
          }}
        >
          <div className="bg-amber-50 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowNoteModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              📝 Take a Note
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex-1 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 disabled:opacity-50 transition-all min-h-[44px]"
                >
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryBook;
