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
        <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700 hover:border-blue-300">
          <Facebook className="h-4 w-4" />
        </Button>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
        <Button variant="outline" size="icon" className="rounded-full hover:bg-sky-50 text-sky-500 hover:text-sky-600 hover:border-sky-300">
          <Twitter className="h-4 w-4" />
        </Button>
      </a>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <Button variant="outline" size="icon" className="rounded-full hover:bg-green-50 text-green-500 hover:text-green-600 hover:border-green-300">
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
            className="h-4 w-4"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </Button>
      </a>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="rounded-full hover:bg-gray-100"
        title="Copy Link"
        aria-label="Copy Link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
