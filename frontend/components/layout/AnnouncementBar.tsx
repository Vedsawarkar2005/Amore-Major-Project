"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ANNOUNCEMENTS = [
  "COMPLIMENTARY EXPRESS DELIVERY ON ALL PREPAID ORDERS ACROSS INDIA",
  "FORMULATED BY LICENSED COSMETOLOGISTS • VEGAN & CRUELTY-FREE",
  "HYDRAVELVET LIPSTICK — INFUSED WITH BLUEBERRY BUTTER & AVOCADO OIL",
  "100% CLEAN BOTANICAL INGREDIENTS • ZERO HARMFUL CHEMICALS",
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="relative bg-black text-white text-[11px] font-medium tracking-[0.2em] uppercase py-2 px-4 select-none border-b border-neutral-900 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="text-neutral-400 hover:text-white transition-colors p-0.5 focus:outline-none"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 text-center truncate px-2 transition-all duration-300">
          <span>{ANNOUNCEMENTS[currentIndex]}</span>
        </div>

        <button
          onClick={handleNext}
          aria-label="Next announcement"
          className="text-neutral-400 hover:text-white transition-colors p-0.5 focus:outline-none"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
