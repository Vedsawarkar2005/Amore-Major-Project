"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Product } from "@/data/products";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart, openCart } = useCart();

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((product) => {
      addToCart(product, 1);
      removeFromWishlist(product.id);
    });
    openCart();
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header */}
      <div className="border-b border-neutral-200 py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            PRIVATE SELECTION
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            SAVED SHADES ({wishlistCount})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide">
            Your personalized editorial shortlist of Hydravelvet lipstick shades.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 border border-neutral-200 p-8 max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 border border-neutral-300 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-neutral-400" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="text-xs text-neutral-500 tracking-wide font-light leading-relaxed">
              Explore our 12-shade Hydravelvet collection and click the heart icon on any shade to save
              it here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
            >
              <span>EXPLORE ALL SHADES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
                {wishlistCount} {wishlistCount === 1 ? "SHADE" : "SHADES"} SAVED
              </span>
              <button
                onClick={handleMoveAllToCart}
                className="text-xs uppercase tracking-wider font-semibold text-black underline hover:opacity-70 flex items-center space-x-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>MOVE ALL TO BAG</span>
              </button>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  className="border border-neutral-200 bg-white flex flex-col justify-between group hover:border-black transition-colors"
                >
                  {/* Image */}
                  <div className="relative aspect-3/4 w-full bg-neutral-100 overflow-hidden">
                    <Link href={`/shop/${product.slug}`} className="block w-full h-full">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 text-neutral-400 hover:text-black border border-neutral-200 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 border-t border-neutral-100 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: product.shade_hex }}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-black">
                          {product.shade_name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ({product.sku})
                        </span>
                      </div>

                      <Link
                        href={`/shop/${product.slug}`}
                        className="block text-xs font-medium uppercase tracking-wider text-black hover:underline line-clamp-1"
                      >
                        {product.name}
                      </Link>

                      <p className="text-xs font-semibold text-black mt-2">
                        {formatINR(product.price)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full py-2.5 bg-black text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>MOVE TO BAG</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
