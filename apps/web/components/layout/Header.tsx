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
import { fetchProducts, mapApiToProduct, ApiProduct } from "@/lib/api";
import { formatINR, generateProductSlug } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { CartDrawer } from "../shop/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";

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

  // Sync navbar transparency with 3D lipstick animation completion
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    // Non-homepage routes immediately show the theme background
    if (pathname !== "/") {
      setIsPastHero(true);
      return;
    }

    // On homepage: initial state is transparent over the 3D sequence
    setIsPastHero(false);

    const checkHeroEnd = () => {
      const marker = document.getElementById("hero-scroll-end");
      if (marker) {
        const rect = marker.getBoundingClientRect();
        // Trigger solid navbar once marker reaches top header height (64px)
        return rect.top <= 64;
      }
      // Fallback: 3D pinned sequence duration (~5.2 viewport heights)
      return window.scrollY > window.innerHeight * 5.2;
    };

    // Run initial position check
    setIsPastHero(checkHeroEnd());

    const marker = document.getElementById("hero-scroll-end");
    let observer: IntersectionObserver | null = null;

    if (marker && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting || entry.boundingClientRect.top <= 64) {
            setIsPastHero(true);
          } else {
            setIsPastHero(false);
          }
        },
        {
          rootMargin: "0px 0px -85% 0px",
          threshold: [0, 1],
        }
      );
      observer.observe(marker);
    }

    const handleScroll = () => {
      setIsPastHero(checkHeroEnd());
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const isHome = pathname === "/";
  const isTransparentHero = isHome && !isPastHero;

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
      <header
        data-site-header
        data-scrolled={isPastHero ? "true" : "false"}
        className={`w-full sticky top-0 z-50 transition-all duration-500 ease-in-out ${
          isTransparentHero
            ? "bg-transparent border-b border-transparent"
            : "bg-[#FDFBF7]/90 backdrop-blur-md border-b border-neutral-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-500 ease-in-out">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className={`lg:hidden p-2 -ml-2 transition-colors duration-500 ease-in-out focus:outline-none ${
                isTransparentHero
                  ? "text-white hover:text-white/80"
                  : "text-neutral-900 hover:text-black"
              }`}
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div
                className={`relative w-9 h-9 flex items-center justify-center rounded-full p-1 transition-all duration-500 ease-in-out ${
                  isTransparentHero
                    ? "bg-white/10 border border-white/20 group-hover:border-white"
                    : "bg-[#FDFBF7] border border-neutral-200 group-hover:border-neutral-900"
                }`}
              >
                <Image
                  src="/brand/amore-logo.svg"
                  alt="Amore Logo"
                  width={28}
                  height={28}
                  className={`w-auto h-7 object-contain transition-all duration-500 ${
                    isTransparentHero ? "invert brightness-200" : ""
                  }`}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-serif uppercase tracking-tight font-bold text-lg sm:text-xl flex items-center gap-2 transition-colors duration-500 ease-in-out ${
                    isTransparentHero ? "text-white" : "text-neutral-900"
                  }`}
                >
                  AMORE
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links in Clean Tracked-Out Typography */}
          <nav className="hidden lg:flex items-center gap-6 sm:gap-8 font-sans">
            <Link
              href="/"
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out ${
                pathname === "/"
                  ? isTransparentHero
                    ? "text-white underline underline-offset-8 decoration-2"
                    : "text-black underline underline-offset-8 decoration-2"
                  : isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-900 hover:text-black"
              }`}
            >
              HOME
            </Link>

            <Link
              href="/about"
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out ${
                pathname === "/about"
                  ? isTransparentHero
                    ? "text-white underline underline-offset-8 decoration-2"
                    : "text-black underline underline-offset-8 decoration-2"
                  : isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-900 hover:text-black"
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
                className={`flex items-center gap-1.5 py-4 text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out ${
                  pathname.startsWith("/shop")
                    ? isTransparentHero
                      ? "text-white underline underline-offset-8 decoration-2"
                      : "text-black underline underline-offset-8 decoration-2"
                    : isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-900 hover:text-black"
                }`}
              >
                <span>STORE</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 stroke-[2] transition-colors duration-500 ${
                    isTransparentHero ? "text-white/90" : "text-neutral-600"
                  }`}
                />
              </Link>

              {/* Dropdown Menu */}
              {isShopDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#FDFBF7] border border-neutral-200 shadow-xl py-4 px-4 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="space-y-3">
                    <Link
                      href="/shop"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-xs font-bold uppercase tracking-[0.18em] text-neutral-950 hover:text-black pb-2 border-b border-neutral-200 transition-colors duration-300"
                    >
                      ALL 12 SHADES
                    </Link>
                    <Link
                      href="/shop?collection=Everyday+Nudes"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 hover:text-black hover:translate-x-1 transition-all duration-300"
                    >
                      Everyday Nudes
                    </Link>
                    <Link
                      href="/shop?collection=Bold+Colors"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 hover:text-black hover:translate-x-1 transition-all duration-300"
                    >
                      Bold Colors
                    </Link>
                    <Link
                      href="/shop?collection=HydraCream+Series"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-700 hover:text-black hover:translate-x-1 transition-all duration-300"
                    >
                      HydraCream Series
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/try-on"
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out flex items-center gap-1.5 ${
                pathname === "/try-on"
                  ? isTransparentHero
                    ? "text-white underline underline-offset-8 decoration-2"
                    : "text-black underline underline-offset-8 decoration-2"
                  : isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-900 hover:text-black"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
              <span>TRY-ON</span>
            </Link>

            <Link
              href="/contact-us"
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out ${
                pathname === "/contact-us"
                  ? isTransparentHero
                    ? "text-white underline underline-offset-8 decoration-2"
                    : "text-black underline underline-offset-8 decoration-2"
                  : isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-900 hover:text-black"
              }`}
            >
              CONTACT
            </Link>

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-500 ease-in-out px-2.5 py-1 border ${
                  isTransparentHero
                    ? "border-white/40 text-white hover:bg-white hover:text-black"
                    : "border-neutral-300 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                ADMIN
              </Link>
            )}

            <div
              className={`h-4 w-px mx-1 hidden sm:block transition-colors duration-500 ${
                isTransparentHero ? "bg-white/20" : "bg-neutral-200"
              }`}
            />

            {/* Action icons: Search, Virtual Try-On, Wishlist, Cart, User Auth */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-1.5 transition-colors duration-500 ease-in-out focus:outline-none ${
                  isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                }`}
                aria-label="Search shades"
              >
                <Search className="w-4.5 h-4.5 stroke-[1.75]" />
              </button>

              {/* Virtual Try-On Quick Access */}
              <Link
                href="/try-on"
                className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                  isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                }`}
                aria-label="Virtual Try-On"
                title="Virtual Try-On"
              >
                <Sparkles className="w-4.5 h-4.5 stroke-[1.75]" />
              </Link>

              {/* Wishlist Trigger */}
              <Link
                href="/wishlist"
                className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                  isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                }`}
                aria-label={`Wishlist with ${wishlistCount} saved items`}
                title="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 stroke-[1.75]" />
                {wishlistCount > 0 && (
                  <span
                    className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 font-mono font-bold transition-colors duration-500 ${
                      isTransparentHero
                        ? "bg-white text-black"
                        : "bg-neutral-900 text-white"
                    }`}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={openCart}
                className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                  isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                }`}
                aria-label={`Shopping bag with ${totalItems} items`}
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4.5 h-4.5 stroke-[1.75]" />
                {totalItems > 0 && (
                  <span
                    className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 font-mono font-bold transition-colors duration-500 ${
                      isTransparentHero
                        ? "bg-white text-black"
                        : "bg-neutral-900 text-white"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Trigger */}
              <button
                onClick={openAuthModal}
                className={`p-1.5 transition-colors duration-500 ease-in-out focus:outline-none flex items-center gap-1.5 ${
                  isTransparentHero
                    ? "text-white/90 hover:text-white"
                    : "text-neutral-700 hover:text-black"
                }`}
                aria-label={isAuthenticated && user ? `Account: ${user.name}` : "Sign in / Register"}
              >
                {isAuthenticated && user ? (
                  <div
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono transition-colors duration-500 ${
                      isTransparentHero
                        ? "bg-white text-black"
                        : "bg-neutral-900 text-white"
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-4.5 h-4.5 stroke-[1.75]" />
                )}
                {isAuthenticated && user && (
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider hidden xl:inline transition-colors duration-500 ${
                      isTransparentHero ? "text-white" : "text-neutral-900"
                    }`}
                  >
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
              className={`p-1.5 transition-colors duration-500 ease-in-out focus:outline-none ${
                isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-700 hover:text-black"
              }`}
              aria-label="Search shades"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.75]" />
            </button>

            {/* Mobile Auth Button */}
            <button
              onClick={openAuthModal}
              className={`p-1.5 transition-colors duration-500 ease-in-out focus:outline-none ${
                isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-700 hover:text-black"
              }`}
              aria-label={isAuthenticated && user ? `Account: ${user.name}` : "Sign in"}
            >
              {isAuthenticated && user ? (
                <div
                  className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono transition-colors duration-500 ${
                    isTransparentHero
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4.5 h-4.5 stroke-[1.75]" />
              )}
            </button>

            {/* Mobile Virtual Try-On */}
            <Link
              href="/try-on"
              className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-700 hover:text-black"
              }`}
              aria-label="Virtual Try-On"
              title="Virtual Try-On"
            >
              <Sparkles className="w-4.5 h-4.5 stroke-[1.75]" />
            </Link>

            <Link
              href="/wishlist"
              className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-700 hover:text-black"
              }`}
              aria-label={`Wishlist with ${wishlistCount} saved items`}
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5 stroke-[1.75]" />
              {wishlistCount > 0 && (
                <span
                  className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 font-mono font-bold transition-colors duration-500 ${
                    isTransparentHero
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className={`p-1.5 transition-colors duration-500 ease-in-out relative focus:outline-none ${
                isTransparentHero
                  ? "text-white/90 hover:text-white"
                  : "text-neutral-700 hover:text-black"
              }`}
              aria-label={`Shopping bag with ${totalItems} items`}
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.75]" />
              {totalItems > 0 && (
                <span
                  className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 font-mono font-bold transition-colors duration-500 ${
                    isTransparentHero
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-[#FDFBF7] border-b border-neutral-200 shadow-md py-6 px-4 sm:px-8 z-50 animate-in fade-in duration-300">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center border-b border-neutral-900 pb-2">
                <Search className="w-5 h-5 text-neutral-500 mr-3 stroke-[1.5]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH BY SHADE NAME (e.g., BRICK BROWN, BARELY CHESTNUT, HVL001)..."
                  className="w-full text-xs sm:text-sm tracking-widest uppercase focus:outline-none text-neutral-900 placeholder:text-neutral-400 font-medium bg-transparent"
                  suppressHydrationWarning
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black transition-colors duration-300 focus:outline-none"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Instant Search Results */}
              {searchQuery.trim() !== "" && (
                <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-neutral-200/60">
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
                        className="py-3 flex items-center justify-between hover:bg-neutral-100/60 px-2 transition-colors duration-300 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 bg-neutral-50 border border-neutral-200 overflow-hidden shrink-0">
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
                              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900 group-hover:underline">
                                {product.shade_name}
                              </p>
                            </div>
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                              {product.sku} • {product.collection}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-medium text-neutral-900">
                            {formatINR(product.price)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300" />
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
