"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Facebook, Instagram, Twitter, Link as LinkIcon, AtSign, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

// Hardcoded array of nice background gradients
const BACKGROUND_GRADIENTS = [
  "linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
];

const FONTS = [
  "var(--font-caveat)",
  "var(--font-pacifico)",
  "var(--font-dancing-script)",
];

export default function ShareModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dailyVerse, setDailyVerse] = useState<{ verse: string; book: string; chapter: number; verse_number: number } | null>(null);
  const [bgGradient, setBgGradient] = useState(BACKGROUND_GRADIENTS[0]);
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [copied, setCopied] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch verse
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch('/api/dailyVerse');
        if (response.ok) {
          const data = await response.json();
          setDailyVerse(data);
        }
      } catch (error) {
        console.error('Error fetching daily verse:', error);
      }
    };
    fetchVerse();
  }, []);

  // Initialize random styles deterministically based on date
  useEffect(() => {
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bgIndex = Math.abs(hash) % BACKGROUND_GRADIENTS.length;
    const fontIndex = Math.abs(hash) % FONTS.length;
    
    setBgGradient(BACKGROUND_GRADIENTS[bgIndex]);
    setFontFamily(FONTS[fontIndex]);
  }, []);

  // Exit intent and Scroll trigger
  useEffect(() => {
    const checkAndShowModal = () => {
      const lastShown = localStorage.getItem('shareModalLastShown');
      const todayDate = new Date().toDateString();
      if (lastShown !== todayDate && dailyVerse) {
        setIsOpen(true);
        localStorage.setItem('shareModalLastShown', todayDate);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        checkAndShowModal();
      }
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollY = window.scrollY;
      
      if (scrollY + clientHeight >= scrollHeight * 0.5) {
        checkAndShowModal();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dailyVerse]);

  // Generate Image Blob using html2canvas
  const generateImageBlob = async (): Promise<Blob | null> => {
    if (!previewRef.current) return null;
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: null
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asbible-daily-verse.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareToPlatform = async (platform: string) => {
    const shareText = dailyVerse 
      ? `"${dailyVerse.verse}" - ${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verse_number}`
      : "Check out today's daily verse!";

    const shareUrl = `${window.location.origin}/verse`;

    // 1. Direct Web Intents for Facebook, Twitter, Threads
    const webIntentPlatforms = ['facebook', 'twitter', 'threads'];
    if (webIntentPlatforms.includes(platform)) {
      let intentUrl = '';
      const pageUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(shareText);
      
      if (platform === 'facebook') intentUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      if (platform === 'twitter') intentUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodedText}`;
      if (platform === 'threads') intentUrl = `https://threads.net/intent/post?text=${encodedText}%20${pageUrl}`;
      
      if (intentUrl) {
        window.open(intentUrl, '_blank', 'width=600,height=400');
      }
      return;
    }

    // 2. Native Share for Instagram
    if (platform === 'instagram') {
      if (navigator.share) {
        const shareData: ShareData = {
          title: 'Daily Verse',
          text: shareText,
          url: shareUrl,
        };
        const blob = await generateImageBlob();
        if (blob) {
          const file = new File([blob], "daily-verse.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          console.log("Share API cancelled or failed", err);
          return;
        }
      } else {
        alert("Please use a mobile device to share directly to Instagram, or click 'Download Image' to save the image and post it manually.");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/verse`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!isOpen || !dailyVerse) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[450px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-3 flex items-center justify-center border-b">
          <h2 className="text-base font-bold">SHARE THIS VERSE</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Image Preview Container */}
          <div className="mb-5 flex justify-center">
            <div 
              ref={previewRef}
              className="w-full max-w-[320px] aspect-square rounded-lg shadow-sm flex flex-col relative overflow-hidden"
              style={{ background: bgGradient }}
            >
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-800">
                <p 
                  className="text-3xl leading-snug"
                  style={{ fontFamily }}
                >
                  &quot;{dailyVerse.verse}&quot;
                </p>
                <p className="mt-3 font-semibold text-sm">
                  {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse_number}
                </p>
              </div>
              <div className="w-full py-1.5 bg-black/10 backdrop-blur-sm text-center">
                <p className="text-[10px] text-gray-800/80 font-medium tracking-wide">
                  © asbible.com | asbible.com/daily-verse
                </p>
              </div>
            </div>
          </div>

          {/* Primary Share Buttons */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => handleShareToPlatform('instagram')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white py-2.5 rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>
            <button 
              onClick={() => handleShareToPlatform('facebook')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#1877F2] text-white py-2.5 rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
            <button 
              onClick={() => handleShareToPlatform('twitter')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white py-2.5 rounded-full font-bold text-xs hover:opacity-90 transition-opacity"
            >
              <Twitter className="w-4 h-4" fill="currentColor" />
              <span>Twitter</span>
            </button>
          </div>

          {/* Secondary Options Divider */}
          <div className="relative flex items-center py-2 mb-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">More Options</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Secondary Options */}
          <div className="flex justify-center gap-2 flex-wrap">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 py-2 px-4 rounded-full font-semibold text-xs hover:bg-gray-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button 
              onClick={() => handleShareToPlatform('threads')}
              className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 py-2 px-4 rounded-full font-semibold text-xs hover:bg-gray-200 transition-colors"
            >
              <AtSign className="w-3.5 h-3.5" /> Threads
            </button>
            <button 
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 py-2 px-4 rounded-full font-semibold text-xs hover:bg-gray-200 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" /> 
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
