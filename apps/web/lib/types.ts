/**
 * Shared domain types for the Amore web application.
 * These types mirror the SQLite schema served by apps/api.
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  category: string;
  collection: "Everyday Nudes" | "Bold Colors" | "HydraCream Series";
  image_url: string;
  secondary_image_url?: string;
  shade_name: string;
  shade_hex: string;
  description: string;
  how_to_use: string;
  ingredients: string;
  in_stock: boolean;
  is_featured?: boolean;
}
