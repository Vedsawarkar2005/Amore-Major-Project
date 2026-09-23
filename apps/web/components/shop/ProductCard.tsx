"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatINR } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

// Luxury deceleration curve
const EASE_LUXURY = [0.25, 0.46, 0.45, 0.94] as const;

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white border border-neutral-200 transition-colors duration-300 hover:border-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Image Container */}
      <div className="relative aspect-3/4 w-full bg-neutral-100 overflow-hidden">
        {/* Framer Motion image wrapper — scales on hover */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.55, ease: EASE_LUXURY }}
        >
          <Link href={`/shop/${product.slug}`} className="block w-full h-full">
            {/* Primary image */}
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className={`object-contain p-4 transition-opacity duration-500 ease-out ${
                product.secondary_image_url && isHovered
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            />

            {/* Secondary hover image */}
            {product.secondary_image_url && (
              <Image
                src={product.secondary_image_url}
                alt={`${product.name} swatch`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain p-4 absolute inset-0 transition-opacity duration-500 ease-out ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </Link>
        </motion.div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_featured && (
            <span className="bg-black text-white text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5">
              SIGNATURE
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-xs text-black border border-neutral-200 hover:bg-black hover:text-white transition-all z-10 focus:outline-none"
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFavorited ? "fill-black text-black" : ""
            }`}
          />
        </button>

        {/* Quick Add Overlay — Framer Motion slide-up from bottom (desktop only) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="quick-add"
              className="absolute bottom-0 left-0 right-0 p-3 hidden sm:block bg-gradient-to-t from-white/90 to-transparent z-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: EASE_LUXURY }}
            >
              <button
                onClick={handleQuickAdd}
                className="w-full py-2.5 bg-black text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-1.5 shadow-md"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>QUICK ADD</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Information Details */}
      <div className="p-4 flex-1 flex flex-col justify-between border-t border-neutral-100">
        <div>
          {/* Shade Hex Dot and Shade Name */}
          <div className="flex items-center space-x-2 mb-1.5">
            <span
              className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
              style={{ backgroundColor: product.shade_hex }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800 truncate">
              {product.shade_name}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              ({product.sku})
            </span>
          </div>

          {/* Product Title */}
          <Link
            href={`/shop/${product.slug}`}
            className="block text-xs uppercase tracking-wider font-medium text-black hover:underline line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Collection Sub-label */}
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
            {product.collection}
          </p>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-black tracking-wide">
            {formatINR(product.price)}
          </span>

          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-1.5 border border-black text-black hover:bg-black hover:text-white transition-colors text-[10px] uppercase font-medium tracking-wider flex items-center space-x-1"
            aria-label="Add to bag"
          >
            <Plus className="w-3 h-3" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
