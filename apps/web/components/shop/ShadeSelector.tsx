"use client";

import React from "react";
import { Product } from "@/lib/types";

interface ShadeSelectorProps {
  shades: Product[];
  selectedShadeId: string;
  onSelectShade: (shade: Product) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ShadeSelector: React.FC<ShadeSelectorProps> = ({
  shades,
  selectedShadeId,
  onSelectShade,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {shades.map((shade) => {
        const isSelected = shade.id === selectedShadeId;
        return (
          <button
            key={shade.id}
            type="button"
            onClick={() => onSelectShade(shade)}
            className={`group relative rounded-full transition-all focus:outline-none flex items-center justify-center ${
              isSelected ? "ring-2 ring-black ring-offset-2 scale-110" : "hover:scale-105"
            }`}
            title={`${shade.shade_name} (${shade.sku})`}
            aria-label={`Select shade ${shade.shade_name}`}
          >
            <span
              className={`${sizeClasses[size]} rounded-full border border-black/20 block shadow-2xs`}
              style={{ backgroundColor: shade.shade_hex }}
            />
            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md">
              {shade.shade_name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
