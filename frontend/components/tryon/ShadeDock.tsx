"use client";

import React from "react";
import { Check, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Shade } from "@/lib/shades/shadesStore";
import { FinishType } from "@/lib/tryon/lips/lipstickRenderer";

interface ShadeDockProps {
  shades: Shade[];
  selectedShadeId: string;
  onSelectShade: (shadeId: string) => void;
  selectedFinish: FinishType;
  setSelectedFinish: (finish: FinishType) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  activeShade: Shade | undefined;
  onClearShade: () => void;
}

export function ShadeDock({
  shades,
  selectedShadeId,
  onSelectShade,
  selectedFinish,
  setSelectedFinish,
  opacity,
  setOpacity,
  activeShade,
  onClearShade,
}: ShadeDockProps) {
  // 12 swatches for 2×6 grid
  const dockShades = shades.slice(0, 12);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Active Shade Metadata Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-md flex flex-col gap-4 text-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border border-black/10 shadow-sm flex-shrink-0 transition-colors duration-300"
              style={{
                backgroundColor: activeShade ? activeShade.hex : "#E4E4E7",
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold">
                  Amore HydraVelvet™
                </span>
                {activeShade?.sku && (
                  <span className="text-[10px] font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                    {activeShade.sku}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold font-serif text-black tracking-tight leading-tight">
                {activeShade ? activeShade.name : "Select a Shade"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeShade && (
              <button
                onClick={onClearShade}
                title="Remove shade"
                className="flex items-center gap-1 text-xs text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1.5 rounded-xl border border-zinc-200 transition font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <Link
              href="/shop"
              className="text-xs text-black hover:opacity-60 font-semibold ml-1 uppercase tracking-wider"
            >
              Shop
            </Link>
          </div>
        </div>

        {/* Finish & Intensity Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Finish Texture
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(["Velvet Matte", "Matte", "Satin", "Glossy"] as FinishType[]).map((finish) => (
                <button
                  key={finish}
                  onClick={() => setSelectedFinish(finish)}
                  className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition truncate ${
                    selectedFinish === finish
                      ? "bg-black border-black text-white shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-black/30"
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              <span>Coverage</span>
              <span className="font-mono text-zinc-900 font-bold">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-zinc-100 border border-zinc-200 accent-black cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2×6 Shade Swatch Dock */}
      <div className="w-full bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col items-center gap-3 text-white">
        <div className="w-full flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
            Shade Palette ({dockShades.length})
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">2×6 Dock</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-6 grid-rows-2 gap-2.5 sm:gap-3 w-full">
          {dockShades.map((shade) => {
            const isSelected = shade.id === selectedShadeId;
            return (
              <button
                key={shade.id}
                onClick={() => onSelectShade(shade.id)}
                title={`${shade.name} (${shade.hex})`}
                className={`group relative aspect-square rounded-full p-0.5 flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-xl"
                    : "hover:scale-105 opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className="w-full h-full rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: shade.hex }}
                >
                  {isSelected && (
                    <div className="w-full h-full bg-black/25 flex items-center justify-center rounded-full">
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
