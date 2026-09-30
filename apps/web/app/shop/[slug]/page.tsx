import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchProducts, fetchProductBySku, mapApiToProduct, ApiProduct } from "@/lib/api";
import { Product } from "@/lib/types";
import { generateProductSlug } from "@/lib/utils";
import { ProductDetailView } from "@/components/shop/ProductDetailView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const products = await fetchProducts();
    return products.map((p) => ({ slug: generateProductSlug(p.sku) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const products = await fetchProducts();
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
    const raw = await fetchProducts();
    allProducts = raw.map(mapApiToProduct);
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
