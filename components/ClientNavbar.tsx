// components/ClientNavbar.tsx
"use client"; // Client Component

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu } from 'lucide-react'; // Import icons

export default function ClientNavbar() {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage the mobile menu

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full">
      <Link className="flex items-center justify-center" href="/">
        <BookOpen className="h-6 w-6" />
        <span className="sr-only">asBible</span>
      </Link>
      
      {/* Hamburger Icon for Mobile */}
      <button 
        className="lg:hidden block focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/bible">
          Read Bible
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/blog">
          Blog
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/chat">
          Chat with Bible
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <nav className={`lg:hidden flex flex-col gap-4 sm:gap-6 absolute top-14 left-0 w-full bg-white dark:bg-gray-800 p-4 transition-all duration-300 ease-in-out ${menuOpen ? 'block' : 'hidden'}`}>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/bible">
          Read Bible
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/blog">
          Blog
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/chat">
          Chat with Bible
        </Link>
      </nav>
    </header>
  );
}
