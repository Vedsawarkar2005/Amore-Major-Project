import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/data/products";
import { ProductDetailView } from "./ProductDetailView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | AMORE",
    };
  }

  return {
    title: `${product.name} – AMORE Cosmetics`,
    description: `${product.description} Shade: ${product.shade_name} (${product.sku}). MRP ₹${product.price}.`,
    openGraph: {
      title: `${product.name} | AMORE COSMETICS`,
      description: product.description,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Related shades from the same or neighboring collection
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailView product={product} allProducts={products} relatedProducts={relatedProducts} />;
}
