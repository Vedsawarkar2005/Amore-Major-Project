"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  X,
  ChevronDown,
  ArrowRight,
  User,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/lib/types";
import { fetchProducts, ApiProduct } from "@/lib/api";
import { formatINR, generateProductSlug } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { CartDrawer } from "../shop/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";

/** Map a raw API product to the frontend Product shape */
function mapApiToProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
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
  };
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch product catalog once on first search open
  useEffect(() => {
    if (!isSearchOpen || allProducts.length > 0) return;
    fetchProducts()
      .then((items) => setAllProducts(items.map(mapApiToProduct)))
      .catch(() => {}); // silently ignore if API is unavailable
  }, [isSearchOpen, allProducts.length]);

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shade_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  // Focus search input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <header className="w-full border-b border-black/10 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 text-black hover:opacity-60 transition-opacity focus:outline-none"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-black/10 p-1 group-hover:border-black transition">
                <Image
                  src="/brand/amore-logo.svg"
                  alt="Amore Logo"
                  width={28}
                  height={28}
                  className="w-auto h-7 object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif font-bold tracking-wider text-black flex items-center gap-2">
                  AMORE
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links in Montserrat / Modern Font */}
          <nav className="hidden lg:flex items-center gap-6 sm:gap-8 font-sans">
            <Link
              href="/"
              className={`text-xs uppercase tracking-widest font-semibold transition-opacity ${
                pathname === "/" ? "text-black opacity-100 font-bold" : "text-black hover:opacity-60"
              }`}
            >
              HOME
            </Link>

            <Link
              href="/about"
              className={`text-xs uppercase tracking-widest font-semibold transition-opacity ${
                pathname === "/about" ? "text-black opacity-100 font-bold" : "text-black hover:opacity-60"
              }`}
            >
              ABOUT
            </Link>

            {/* Shop with Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                href="/shop"
                className={`flex items-center gap-1 py-4 text-xs uppercase tracking-widest font-semibold transition-opacity ${
                  pathname.startsWith("/shop")
                    ? "text-black opacity-100 font-bold"
                    : "text-black hover:opacity-60"
                }`}
              >
                <span>STORE</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Link>

              {/* Dropdown Menu */}
              {isShopDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-neutral-200 shadow-lg py-3 px-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="space-y-2.5">
                    <Link
                      href="/shop"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-xs font-semibold uppercase tracking-[0.15em] text-black hover:underline pb-1 border-b border-neutral-100"
                    >
                      ALL 12 SHADES
                    </Link>
                    <Link
                      href="/shop?collection=Everyday+Nudes"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] uppercase tracking-wider text-neutral-600 hover:text-black hover:translate-x-1 transition-all"
                    >
                      Everyday Nudes
                    </Link>
                    <Link
                      href="/shop?collection=Bold+Colors"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] uppercase tracking-wider text-neutral-600 hover:text-black hover:translate-x-1 transition-all"
                    >
                      Bold Colors
                    </Link>
                    <Link
                      href="/shop?collection=HydraCream+Series"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] uppercase tracking-wider text-neutral-600 hover:text-black hover:translate-x-1 transition-all"
                    >
                      HydraCream Series
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/try-on"
              className={`text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-1.5 ${
                pathname === "/try-on"
                  ? "text-black opacity-100 font-bold"
                  : "text-black hover:opacity-60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>TRY-ON</span>
            </Link>

            <Link
              href="/contact-us"
              className={`text-xs uppercase tracking-widest font-semibold transition-opacity ${
                pathname === "/contact-us"
                  ? "text-black opacity-100 font-bold"
                  : "text-black hover:opacity-60"
              }`}
            >
              CONTACT
            </Link>

            <div className="h-4 w-px bg-black/10 mx-1 hidden sm:block" />

            {/* Action icons: Search, Virtual Try-On, Wishlist, Cart, User Auth */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-black hover:opacity-60 transition-opacity focus:outline-none"
                aria-label="Search shades"
              >
                <Search className="w-4.5 h-4.5 stroke-[2]" />
              </button>

              {/* Virtual Try-On Quick Access */}
              <Link
                href="/try-on"
                className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
                aria-label="Virtual Try-On"
                title="Virtual Try-On"
              >
                <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
              </Link>

              {/* Wishlist Trigger */}
              <Link
                href="/wishlist"
                className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
                aria-label={`Wishlist with ${wishlistCount} saved items`}
                title="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 stroke-[2]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={openCart}
                className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
                aria-label={`Shopping bag with ${totalItems} items`}
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4.5 h-4.5 stroke-[2]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Trigger */}
              <button
                onClick={openAuthModal}
                className="p-1.5 text-black hover:opacity-60 transition-opacity focus:outline-none flex items-center gap-1.5"
                aria-label={isAuthenticated && user ? `Account: ${user.name}` : "Sign in / Register"}
              >
                {isAuthenticated && user ? (
                  <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-4.5 h-4.5 stroke-[2]" />
                )}
                {isAuthenticated && user && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider hidden xl:inline">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Right Icons */}

          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-black hover:opacity-60 transition-opacity focus:outline-none"
              aria-label="Search shades"
            >
              <Search className="w-4.5 h-4.5 stroke-[2]" />
            </button>

            {/* Mobile Auth Button */}
            <button
              onClick={openAuthModal}
              className="p-1.5 text-black hover:opacity-60 transition-opacity focus:outline-none"
              aria-label={isAuthenticated && user ? `Account: ${user.name}` : "Sign in"}
            >
              {isAuthenticated && user ? (
                <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold font-mono">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4.5 h-4.5 stroke-[2]" />
              )}
            </button>

            {/* Mobile Virtual Try-On */}
            <Link
              href="/try-on"
              className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
              aria-label="Virtual Try-On"
              title="Virtual Try-On"
            >
              <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
            </Link>

            <Link
              href="/wishlist"
              className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
              aria-label={`Wishlist with ${wishlistCount} saved items`}
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5 stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="p-1.5 text-black hover:opacity-60 transition-opacity relative focus:outline-none"
              aria-label={`Shopping bag with ${totalItems} items`}
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 px-4 sm:px-8 z-50 animate-in fade-in duration-200">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center border-b-2 border-black pb-2">
                <Search className="w-5 h-5 text-neutral-400 mr-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH BY SHADE NAME (e.g., BRICK BROWN, BARELY CHESTNUT, HVL001)..."
                  className="w-full text-xs sm:text-sm tracking-widest uppercase focus:outline-none text-black placeholder:text-neutral-400 font-medium"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-neutral-400 hover:text-black focus:outline-none"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Search Results */}
              {searchQuery.trim() !== "" && (
                <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-neutral-100">
                  {searchResults.length === 0 ? (
                    <p className="py-6 text-center text-xs tracking-wider uppercase text-neutral-500">
                      No shades found matching &quot;{searchQuery}&quot;.
                    </p>
                  ) : (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${generateProductSlug(product.sku)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="py-3 flex items-center justify-between hover:bg-neutral-50 px-2 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                                style={{ backgroundColor: product.shade_hex }}
                              />
                              <p className="text-xs font-semibold uppercase tracking-wider text-black group-hover:underline">
                                {product.shade_name}
                              </p>
                            </div>
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                              {product.sku} • {product.collection}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-medium text-black">
                            {formatINR(product.price)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Drawers & Modals */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <CartDrawer />
      <AuthModal />
    </>
  );
};
