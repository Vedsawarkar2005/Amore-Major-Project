import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchProducts, fetchProductBySku, ApiProduct } from "@/lib/api";
import { Product } from "@/lib/types";
import { generateProductSlug } from "@/lib/utils";
import { ProductDetailView } from "./ProductDetailView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Map a raw API product to the frontend Product shape */
function mapApiToProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: `Hydravelvet Lipstick – ${p.name}`,
    slug: generateProductSlug(p.sku),
    sku: p.sku,
    price: p.price,
    category: "Lips",
    collection: "HydraCream Series",
    image_url: p.image_url,
    shade_name: p.name,
    shade_hex: p.shade_hex || "#9B111E",
    description: p.description || "",
    how_to_use: "",
    ingredients: "",
    in_stock: p.stock > 0,
    is_featured: true,
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const products: ApiProduct[] = data.products || [];
    return products.map((p) => ({ slug: generateProductSlug(p.sku) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const products: ApiProduct[] = data.products || [];
      const raw = products.find((p) => generateProductSlug(p.sku) === slug);
      if (raw) {
        const product = mapApiToProduct(raw);
        return {
          title: `${product.name} – AMORE Cosmetics`,
          description: `${product.description} Shade: ${product.shade_name} (${product.sku}). MRP ₹${product.price}.`,
          openGraph: {
            title: `${product.name} | AMORE COSMETICS`,
            description: product.description,
            images: [{ url: product.image_url, width: 800, height: 800, alt: product.name }],
          },
        };
      }
    }
  } catch {
    // fall through
  }

  return { title: "Product Not Found | AMORE" };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch all products to find this one and build related + shade picker
  let allProducts: Product[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const raw: ApiProduct[] = data.products || [];
      allProducts = raw.map(mapApiToProduct);
    }
  } catch {
    // API unavailable
  }

  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      allProducts={allProducts}
      relatedProducts={relatedProducts}
    />
  );
}
