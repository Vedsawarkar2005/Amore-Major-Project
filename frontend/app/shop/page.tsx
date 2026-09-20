"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCollection = searchParams.get("collection") || "All";

  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollection);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");

  const collections = ["All", "Everyday Nudes", "Bold Colors", "HydraCream Series"];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Collection filter
        if (selectedCollection !== "All" && p.collection !== selectedCollection) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchShade = p.shade_name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchShade && !matchSku) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.shade_name.localeCompare(b.shade_name);
        return 0; // default order
      });
  }, [selectedCollection, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCollection("All");
    setSearchQuery("");
    setSortBy("default");
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Category Header */}
      <div className="border-b border-neutral-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center bg-neutral-50">
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            THE HYDRAVELVET COLLECTION
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            ALL LIPSTICK SHADES
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-xl mx-auto tracking-wide leading-relaxed">
            A veil of care, a touch of colour. Infused with nourishing Blueberry Butter, Avocado Oil,
            and Vitamin E. Delivering a soft velvety finish with effortless comfort.
          </p>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="border-b border-neutral-200 sticky top-18 z-20 bg-white/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Collection Tab Filters */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {collections.map((coll) => {
              const count =
                coll === "All"
                  ? products.length
                  : products.filter((p) => p.collection === coll).length;
              const isActive = selectedCollection === coll;

              return (
                <button
                  key={coll}
                  onClick={() => setSelectedCollection(coll)}
                  className={`px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.15em] transition-all whitespace-nowrap focus:outline-none ${
                    isActive
                      ? "bg-black text-white"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                  }`}
                >
                  {coll} ({count})
                </button>
              );
            })}
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH SHADE OR SKU..."
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 text-[11px] uppercase tracking-wider focus:outline-none focus:border-black placeholder:text-neutral-400 text-black"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 text-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 px-3 py-1.5 text-[11px] uppercase tracking-wider bg-white focus:outline-none focus:border-black cursor-pointer text-black"
                aria-label="Sort shades"
              >
                <option value="default">SORT: DEFAULT</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
                <option value="name-asc">NAME: A TO Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-neutral-200 p-8 max-w-md mx-auto space-y-4">
            <SlidersHorizontal className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
              NO SHADES MATCHED YOUR FILTER
            </h3>
            <p className="text-xs text-neutral-500 tracking-wide">
              Try adjusting your search criteria or reset your filters to explore the entire 12-shade
              palette.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET ALL FILTERS</span>
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedCollection + searchQuery + sortBy}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    delay: index * 0.045,
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footnote reassurance */}
        <div className="mt-16 pt-8 border-t border-neutral-200 text-center text-xs text-neutral-500 uppercase tracking-widest">
          ALL 12 SHADES PRICED AT ₹349.00 INCLUSIVE OF TAXES • COMPLIMENTARY EXPRESS DELIVERY AVAILABLE
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-widest text-neutral-500">
          Loading Hydravelvet Catalogue...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
