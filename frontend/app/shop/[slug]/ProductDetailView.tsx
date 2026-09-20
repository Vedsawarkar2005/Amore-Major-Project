"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  Check,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Camera,
} from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatINR } from "@/lib/utils";

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  relatedProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<string>(product.image_url);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string>("description");

  const isFavorited = isInWishlist(product.id);

  // Gallery images array
  const galleryImages = [
    product.image_url,
    ...(product.secondary_image_url ? [product.secondary_image_url] : []),
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    openCart();
  };

  const handleShadeSelect = (shade: Product) => {
    router.push(`/shop/${shade.slug}`);
  };

  const toggleSection = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? "" : section));
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumbs */}
      <div className="border-b border-neutral-200 py-3.5 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Link href="/" className="hover:text-black">
            HOME
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black">
            SHOP
          </Link>
          <span>/</span>
          <Link
            href={`/shop?collection=${encodeURIComponent(product.collection)}`}
            className="hover:text-black"
          >
            {product.collection}
          </Link>
          <span>/</span>
          <span className="text-black font-semibold truncate">{product.name}</span>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail Selectors */}
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-visible">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-18 h-20 sm:w-20 sm:h-24 bg-neutral-100 border-2 transition-all shrink-0 ${
                      selectedImage === img ? "border-black" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Primary Image Display */}
            <div className="relative aspect-4/5 w-full bg-neutral-100 border border-neutral-200 overflow-hidden">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-8 hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Wishlist Heart on top right of image */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-xs text-black border border-neutral-200 hover:bg-black hover:text-white transition-colors focus:outline-none"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? "fill-black text-black" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Commerce Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-neutral-200 pb-6">
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
                <span>{product.sku}</span>
                <span>•</span>
                <span>{product.collection}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-medium uppercase tracking-tight">
                {product.name}
              </h1>

              {/* Price & Tax notice */}
              <div className="flex items-baseline space-x-3 pt-1">
                <span className="text-xl font-semibold text-black tracking-wide">
                  {formatINR(product.price)}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-neutral-500">
                  MRP INCL. OF ALL TAXES
                </span>
              </div>
            </div>

            {/* Shade Selection Matrix (All 12 Shades) */}
            <div className="space-y-3 border-b border-neutral-200 pb-6">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase">
                <span className="font-semibold text-black">
                  SHADE: <span className="font-normal text-neutral-600">{product.shade_name}</span>
                </span>
                <span className="text-neutral-500 text-[11px]">
                  12 SHADES AVAILABLE
                </span>
              </div>

              {/* 12 Swatches Picker */}
              <div className="flex flex-wrap gap-2.5 items-center">
                {allProducts.map((shade) => {
                  const isCurrent = shade.id === product.id;
                  return (
                    <button
                      key={shade.id}
                      type="button"
                      onClick={() => handleShadeSelect(shade)}
                      className={`group relative rounded-full transition-all focus:outline-none flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-black ring-offset-2 scale-110"
                          : "hover:scale-105"
                      }`}
                      title={`${shade.shade_name} (${shade.sku})`}
                      aria-label={`Select shade ${shade.shade_name}`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/20 block shadow-2xs"
                        style={{ backgroundColor: shade.shade_hex }}
                      />
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {shade.shade_name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add-To-Bag CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Box */}
                <div className="flex items-center border border-neutral-300 h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 h-full text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold text-black min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 h-full text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO BAG • {formatINR(product.price * quantity)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full h-12 border border-black text-black text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>INSTANT CHECKOUT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Virtual Try-On Button */}
              <Link
                href={`/try-on?shade=${encodeURIComponent(product.sku)}`}
                className="w-full h-12 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-medium uppercase tracking-[0.25em] transition-colors flex items-center justify-center space-x-2 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
                <span>TRY ON THIS SHADE</span>
              </Link>
            </div>

            {/* Quick Formulation Highlights */}
            <div className="py-4 border-y border-neutral-200 grid grid-cols-2 gap-3 text-[11px] uppercase tracking-wider text-neutral-700">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
                <span>Blueberry Butter Care</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
                <span>Avocado Oil & Vitamin E</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-black shrink-0" />
                <span>Pan-India 0-7 Day Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-black shrink-0" />
                <span>15-Day Quality Guarantee</span>
              </div>
            </div>

            {/* Editorial Accordion */}
            <div className="border-b border-neutral-200 divide-y divide-neutral-200">
              {/* Accordion: Description */}
              <div>
                <button
                  onClick={() => toggleSection("description")}
                  className="w-full py-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-black hover:text-neutral-600 transition-colors text-left"
                >
                  <span>DESCRIPTION</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "description" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light tracking-wide space-y-2">
                    <p>{product.description}</p>
                    <p>
                      Infused with nourishing Blueberry Butter, Avocado Oil, and Vitamin E,
                      delivering a soft velvety finish with effortless comfort. Gentle and harmless
                      on the lips, the formula helps soothe, hydrate, and protect against dryness.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion: How to Use */}
              <div>
                <button
                  onClick={() => toggleSection("how-to-use")}
                  className="w-full py-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-black hover:text-neutral-600 transition-colors text-left"
                >
                  <span>HOW TO USE</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === "how-to-use" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "how-to-use" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
                    <p>{product.how_to_use}</p>
                  </div>
                )}
              </div>

              {/* Accordion: Ingredients */}
              <div>
                <button
                  onClick={() => toggleSection("ingredients")}
                  className="w-full py-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-black hover:text-neutral-600 transition-colors text-left"
                >
                  <span>COMPLETE INGREDIENTS</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === "ingredients" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "ingredients" && (
                  <div className="pb-4 text-[11px] text-neutral-600 font-mono leading-relaxed">
                    <p>{product.ingredients}</p>
                  </div>
                )}
              </div>

              {/* Accordion: Shipping & Returns */}
              <div>
                <button
                  onClick={() => toggleSection("shipping")}
                  className="w-full py-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-black hover:text-neutral-600 transition-colors text-left"
                >
                  <span>SHIPPING & RETURNS</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "shipping" && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed font-light tracking-wide space-y-2">
                    <p>
                      <strong>Domestic Delivery:</strong> Dispatched within 24-48 hours. Standard
                      delivery timeline is 0-7 business days across all Indian pincodes.
                    </p>
                    <p>
                      <strong>Returns & Replacement:</strong> We offer a 15-day return and refund
                      policy for items that arrive damaged, defective, or missing. An unboxing video
                      is required for verification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Shades Section */}
        <div className="mt-20 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-medium uppercase tracking-tight">
              COMPLEMENTARY SHADES
            </h2>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-wider font-semibold text-black hover:underline flex items-center space-x-1"
            >
              <span>EXPLORE ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
