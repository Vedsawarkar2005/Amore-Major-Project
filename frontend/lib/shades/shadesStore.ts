"use client";

import { useEffect, useState } from "react";
import { FinishType } from "../tryon/lips/lipstickRenderer";

export type Shade = {
  id: string;
  name: string;
  hex: string;
  finish: FinishType;
  price?: number | string;
  sku?: string;
};

// Official Amore HydraVelvet Company Shades — matches products.ts exactly
export const DEFAULT_SHADES: Shade[] = [
  { id: "hvl001", name: "Brick Brown",      hex: "#8A3324", finish: "Velvet Matte", price: 349, sku: "HVL001" },
  { id: "hvl002", name: "Dusty Truffle",    hex: "#7B4B3A", finish: "Velvet Matte", price: 349, sku: "HVL002" },
  { id: "hvl003", name: "Red Ember",        hex: "#9B1B30", finish: "Velvet Matte", price: 349, sku: "HVL003" },
  { id: "hvl004", name: "Pink Berry",       hex: "#B83E5E", finish: "Velvet Matte", price: 349, sku: "HVL004" },
  { id: "hvl005", name: "Soft Peach",       hex: "#C97A63", finish: "Velvet Matte", price: 349, sku: "HVL005" },
  { id: "hvl006", name: "Misty Rose",       hex: "#B56576", finish: "Velvet Matte", price: 349, sku: "HVL006" },
  { id: "hvl007", name: "Caramel Mocha",    hex: "#8B5A3C", finish: "Velvet Matte", price: 349, sku: "HVL007" },
  { id: "hvl008", name: "Barely Chestnut",  hex: "#9E644E", finish: "Velvet Matte", price: 349, sku: "HVL008" },
  { id: "hvl009", name: "Mulberry Wine",    hex: "#6A2037", finish: "Velvet Matte", price: 349, sku: "HVL009" },
  { id: "hvl010", name: "Crimson Charm",    hex: "#A31D2A", finish: "Velvet Matte", price: 349, sku: "HVL010" },
  { id: "hvl011", name: "Wine Stain",       hex: "#5C1D2E", finish: "Velvet Matte", price: 349, sku: "HVL011" },
  { id: "hvl012", name: "Cinnamon Mauve",   hex: "#9E5D67", finish: "Velvet Matte", price: 349, sku: "HVL012" },
];

export function useShades() {
  const [shades] = useState<Shade[]>(DEFAULT_SHADES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return { shades, loaded };
}
