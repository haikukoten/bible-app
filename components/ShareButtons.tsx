"use client";

import React, { useState, useEffect } from "react";
import { Copy, Facebook, Twitter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  horizontal?: boolean;
}

export default function ShareButtons({ title, horizontal = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
  };

  const containerClass = horizontal
    ? "flex flex-row space-x-3 items-center justify-center"
    : "flex flex-col space-y-3 items-center";

  // Prevent hydration mismatch by returning a placeholder or null if url is not yet available
  if (!url) {
    return (
      <div className={containerClass}>
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <Button size="icon" className="rounded-full bg-[#1877F2] text-white hover:bg-[#0c63d4] h-11 w-11 md:h-12 md:w-12 shadow-md hover:shadow-lg transition-all">
          <Facebook className="h-5 w-5" fill="currentColor" />
        </Button>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
        <Button size="icon" className="rounded-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 h-11 w-11 md:h-12 md:w-12 shadow-md hover:shadow-lg transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Button>
      </a>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <Button size="icon" className="rounded-full bg-[#25D366] text-white hover:bg-[#1ebd59] h-11 w-11 md:h-12 md:w-12 shadow-md hover:shadow-lg transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </Button>
      </a>
      <Button
        size="icon"
        onClick={handleCopyLink}
        className="rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:text-gray-900 h-11 w-11 md:h-12 md:w-12 shadow-md hover:shadow-lg transition-all"
        title="Copy Link"
        aria-label="Copy Link"
      >
        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
      </Button>
    </div>
  );
}
