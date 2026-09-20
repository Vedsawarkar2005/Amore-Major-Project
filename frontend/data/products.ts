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

const COMMON_DESCRIPTION =
  "A veil of care, a touch of colour. Hydravelvet Lipstick by AMORE is infused with nourishing Blueberry Butter and protective Avocado Oil and Vitamin E, delivering a soft velvety finish with effortless comfort. Gentle and harmless on the lips, the formula helps soothe, hydrate, and protect against dryness.";

const COMMON_HOW_TO_USE =
  "Apply evenly from the center of the lips outward. For a more defined look, outline the lips first and then fill in with lipstick. Reapply as desired.";

const COMMON_INGREDIENTS =
  "Polyisobutene, Ceresin, Beeswax, Ozokerite, Synthetic Wax, Isononyl Isononanoate, Silica, Microcrystalline Wax, Shea Butter, Caprylic/Capric Triglyceride, Carnauba Wax, Almond oil, Vaccinium.";

export const products: Product[] = [
  {
    id: "hvl001",
    name: "Hydravelvet Lipstick – Brick Brown",
    slug: "hydravelvet-lipstick-brick-brown",
    sku: "HVL001",
    price: 349,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2.png",
    shade_name: "Brick Brown",
    shade_hex: "#8A3324",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
  {
    id: "hvl002",
    name: "Hydravelvet Lipstick – Dusty Truffle",
    slug: "hydravelvet-lipstick-dusty-truffle",
    sku: "HVL002",
    price: 349,
    category: "Lips",
    collection: "Everyday Nudes",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-2.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-1.png",
    shade_name: "Dusty Truffle",
    shade_hex: "#7B4B3A",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
  {
    id: "hvl003",
    name: "Hydravelvet Lipstick – Red Ember",
    slug: "hydravelvet-lipstick-red-ember",
    sku: "HVL003",
    price: 349,
    category: "Lips",
    collection: "Bold Colors",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-3.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-2.png",
    shade_name: "Red Ember",
    shade_hex: "#9B1B30",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl004",
    name: "Hydravelvet Lipstick – Pink Berry",
    slug: "hydravelvet-lipstick-pink-berry",
    sku: "HVL004",
    price: 349,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-4.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-3.png",
    shade_name: "Pink Berry",
    shade_hex: "#B83E5E",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
  {
    id: "hvl005",
    name: "Hydravelvet Lipstick – Soft Peach",
    slug: "hydravelvet-lipstick-soft-peach",
    sku: "HVL005",
    price: 349,
    category: "Lips",
    collection: "Everyday Nudes",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-5.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-4.png",
    shade_name: "Soft Peach",
    shade_hex: "#C97A63",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl006",
    name: "Hydravelvet Lipstick – Misty Rose",
    slug: "hydravelvet-lipstick-misty-rose",
    sku: "HVL006",
    price: 349,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-6.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-5.png",
    shade_name: "Misty Rose",
    shade_hex: "#B56576",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl007",
    name: "Hydravelvet Lipstick – Caramel Mocha",
    slug: "hydravelvet-lipstick-caramel-mocha",
    sku: "HVL007",
    price: 349,
    category: "Lips",
    collection: "Everyday Nudes",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-7.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-6.png",
    shade_name: "Caramel Mocha",
    shade_hex: "#8B5A3C",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
  {
    id: "hvl008",
    name: "Hydravelvet Lipstick – Barely Chestnut",
    slug: "hydravelvet-lipstick-barely-chestnut",
    sku: "HVL008",
    price: 349,
    category: "Lips",
    collection: "Everyday Nudes",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-8.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-7.png",
    shade_name: "Barely Chestnut",
    shade_hex: "#9E644E",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl009",
    name: "Hydravelvet Lipstick – Mulberry Wine",
    slug: "hydravelvet-lipstick-mulberry-wine",
    sku: "HVL009",
    price: 349,
    category: "Lips",
    collection: "Bold Colors",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-9.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-8.png",
    shade_name: "Mulberry Wine",
    shade_hex: "#6A2037",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl010",
    name: "Hydravelvet Lipstick – Crimson Charm",
    slug: "hydravelvet-lipstick-crimson-charm",
    sku: "HVL010",
    price: 349,
    category: "Lips",
    collection: "Bold Colors",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-10.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-9.png",
    shade_name: "Crimson Charm",
    shade_hex: "#A31D2A",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
  {
    id: "hvl011",
    name: "Hydravelvet Lipstick – Wine Stain",
    slug: "hydravelvet-lipstick-wine-stain",
    sku: "HVL011",
    price: 349,
    category: "Lips",
    collection: "Bold Colors",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-11.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-11.png",
    shade_name: "Wine Stain",
    shade_hex: "#5C1D2E",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: false,
  },
  {
    id: "hvl012",
    name: "Hydravelvet Lipstick – Cinnamon Mauve",
    slug: "hydravelvet-lipstick-cinnamon-mauve",
    sku: "HVL012",
    price: 349,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/1-12.png",
    secondary_image_url: "https://amorecosmetics.in/wp-content/uploads/2025/07/2-12.png",
    shade_name: "Cinnamon Mauve",
    shade_hex: "#9E5D67",
    description: COMMON_DESCRIPTION,
    how_to_use: COMMON_HOW_TO_USE,
    ingredients: COMMON_INGREDIENTS,
    in_stock: true,
    is_featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.is_featured);
}
