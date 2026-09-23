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

// Official Amore HydraVelvet Company Shades
export const DEFAULT_SHADES: Shade[] = [
    { id: "1938", name: "Brick Brown", hex: "#8C3725", finish: "Velvet Matte", price: 349, sku: "HVL001" },
    { id: "1993", name: "Dusty Truffle", hex: "#5A2322", finish: "Velvet Matte", price: 349, sku: "HVL002" },
    { id: "1999", name: "Red Ember", hex: "#8E2C2C", finish: "Velvet Matte", price: 349, sku: "HVL003" },
    { id: "2005", name: "Pink Berry", hex: "#8C1D40", finish: "Velvet Matte", price: 349, sku: "HVL004" },
    { id: "2011", name: "Soft Peach", hex: "#AA584E", finish: "Velvet Matte", price: 349, sku: "HVL005" },
    { id: "2017", name: "Misty Rose", hex: "#A15B5C", finish: "Velvet Matte", price: 349, sku: "HVL006" },
    { id: "2018", name: "Caramel Mocha", hex: "#8C3C2A", finish: "Velvet Matte", price: 349, sku: "HVL007" },
    { id: "2030", name: "Barely Chestnut", hex: "#A65B54", finish: "Velvet Matte", price: 349, sku: "HVL008" },
    { id: "2036", name: "Mulberry Wine", hex: "#8E4A52", finish: "Velvet Matte", price: 349, sku: "HVL009" },
    { id: "2042", name: "Crimson Charm", hex: "#B81D24", finish: "Velvet Matte", price: 349, sku: "HVL010" },
    { id: "2048", name: "Wine Stain", hex: "#6E0D13", finish: "Velvet Matte", price: 349, sku: "HVL011" },
    { id: "2054", name: "Cinnamon Mauve", hex: "#8E2F2E", finish: "Velvet Matte", price: 349, sku: "HVL012" }
];

export const INITIAL_SHADES = DEFAULT_SHADES;

const STORAGE_KEY = "amore_shades_v3";
const SHADES_UPDATED_EVENT = "amore-shades-updated";

export function getStoredShades(): Shade[] {
    if (typeof window === "undefined") {
        return DEFAULT_SHADES;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SHADES));
            return DEFAULT_SHADES;
        }
        return JSON.parse(raw);
    } catch (error) {
        console.error("Error reading shades from LocalStorage:", error);
        return DEFAULT_SHADES;
    }
}

export function saveStoredShades(shades: Shade[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shades));
        window.dispatchEvent(new Event(SHADES_UPDATED_EVENT));
    } catch (error) {
        console.error("Error saving shades to LocalStorage:", error);
    }
}

export function addShade(shadeData: Omit<Shade, "id">): Shade {
    const shades = getStoredShades();
    const newShade: Shade = {
        ...shadeData,
        id: `shade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const updated = [newShade, ...shades];
    saveStoredShades(updated);
    return newShade;
}

export function updateShade(id: string, shadeData: Partial<Omit<Shade, "id">>): void {
    const shades = getStoredShades();
    const updated = shades.map((s) => (s.id === id ? { ...s, ...shadeData } : s));
    saveStoredShades(updated);
}

export function deleteShade(id: string): void {
    const shades = getStoredShades();
    const updated = shades.filter((s) => s.id !== id);
    saveStoredShades(updated);
}

export function resetShadesToDefault(): void {
    saveStoredShades(DEFAULT_SHADES);
}

export function useShades() {
    const [shades, setShades] = useState<Shade[]>(DEFAULT_SHADES);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setShades(getStoredShades());
        setLoaded(true);

        const handleUpdate = () => {
            setShades(getStoredShades());
        };

        window.addEventListener(SHADES_UPDATED_EVENT, handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener(SHADES_UPDATED_EVENT, handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    return { shades, loaded };
}
