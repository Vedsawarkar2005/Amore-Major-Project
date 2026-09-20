"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

export function TopNav() {
  return (
    <header className="w-full border-b border-black/10 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 p-1 group-hover:border-black transition">
            <Image
              src="/brand/amore-logo.svg"
              alt="Amore Logo"
              width={28}
              height={28}
              className="w-auto h-7 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold tracking-wider text-black flex items-center gap-2">
              AMORE
            </span>
          </div>
        </Link>

        {/* Navigation Links in Montserrat Font */}
        <nav className="flex items-center gap-6 sm:gap-8 font-sans">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest font-semibold text-black hover:opacity-60 transition-opacity"
          >
            HOME
          </Link>
          <Link
            href="/about"
            className="text-xs uppercase tracking-widest font-semibold text-black hover:opacity-60 transition-opacity"
          >
            ABOUT
          </Link>
          <Link
            href="/store"
            className="text-xs uppercase tracking-widest font-semibold text-black hover:opacity-60 transition-opacity"
          >
            STORE
          </Link>
          <Link
            href="/contact"
            className="text-xs uppercase tracking-widest font-semibold text-black hover:opacity-60 transition-opacity"
          >
            CONTACT
          </Link>
          <div className="h-4 w-px bg-black/10 mx-1 hidden sm:block" />
          <button
            aria-label="User Account"
            className="p-2 text-black hover:opacity-60 transition-opacity rounded-full"
          >
            <User className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </nav>
      </div>
    </header>
  );
}
