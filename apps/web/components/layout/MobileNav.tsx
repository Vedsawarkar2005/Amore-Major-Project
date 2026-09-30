"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ArrowRight,
  Heart,
  Mail,
  Phone,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { wishlistCount } = useWishlist();
  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#FDFBF7] h-full flex flex-col shadow-2xl z-10 border-r border-neutral-200 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-[#FDFBF7]">
          <Link
            href="/"
            onClick={onClose}
            className="text-xl font-serif tracking-tight uppercase text-neutral-900"
          >
            AMORE
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 text-neutral-600 hover:text-black hover:bg-neutral-100/60 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Global Quick-Access Action Grid (Try-On, Wishlist, Cart) */}
        <div className="grid grid-cols-3 border-b border-neutral-200 bg-[#FAF7F2] text-center divide-x divide-neutral-200">
          <Link
            href="/try-on"
            onClick={onClose}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-[#FDFBF7] transition-colors group"
          >
            <Sparkles className="w-4 h-4 stroke-[1.5] text-neutral-700 group-hover:text-black transition-colors" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 group-hover:text-black transition-colors font-medium">
              Try-On
            </span>
          </Link>

          <Link
            href="/wishlist"
            onClick={onClose}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-[#FDFBF7] transition-colors relative group"
          >
            <Heart className="w-4 h-4 stroke-[1.5] text-neutral-700 group-hover:text-black transition-colors" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 group-hover:text-black transition-colors font-medium">
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              onClose();
              openCart();
            }}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-[#FDFBF7] transition-colors relative group focus:outline-none"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5] text-neutral-700 group-hover:text-black transition-colors" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 group-hover:text-black transition-colors font-medium">
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div>
            <nav className="flex flex-col space-y-5">
              <div className="border-b border-neutral-200/80 pb-4">
                <Link
                  href="/"
                  onClick={onClose}
                  className="font-serif text-2xl font-semibold text-neutral-900 hover:text-neutral-500 transition-colors duration-300 block"
                >
                  Home
                </Link>
              </div>

              <div className="border-b border-neutral-200/80 pb-4 space-y-3">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="font-serif text-2xl font-semibold text-neutral-900 hover:text-neutral-500 transition-colors duration-300 flex items-center justify-between"
                >
                  <span>Shop All (12 Shades)</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] text-neutral-400" />
                </Link>
                <div className="pl-2 space-y-2 pt-1">
                  <Link
                    href="/shop?collection=Everyday+Nudes"
                    onClick={onClose}
                    className="block text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    Everyday Nudes
                  </Link>
                  <Link
                    href="/shop?collection=Bold+Colors"
                    onClick={onClose}
                    className="block text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    Bold Colors
                  </Link>
                  <Link
                    href="/shop?collection=HydraCream+Series"
                    onClick={onClose}
                    className="block text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    HydraCream Series
                  </Link>
                </div>
              </div>

              <div className="border-b border-neutral-200/80 pb-4">
                <Link
                  href="/try-on"
                  onClick={onClose}
                  className="font-serif text-2xl font-semibold text-neutral-900 hover:text-neutral-500 transition-colors duration-300 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    <span>Virtual Try-On</span>
                    <Sparkles className="w-4 h-4 stroke-[1.75] text-neutral-400" />
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] text-neutral-400" />
                </Link>
              </div>

              <div className="border-b border-neutral-200/80 pb-4">
                <Link
                  href="/about"
                  onClick={onClose}
                  className="font-serif text-2xl font-semibold text-neutral-900 hover:text-neutral-500 transition-colors duration-300 block"
                >
                  Our Story & Formulation
                </Link>
              </div>

              <div className="border-b border-neutral-200/80 pb-4">
                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="font-serif text-2xl font-semibold text-neutral-900 hover:text-neutral-500 transition-colors duration-300 block"
                >
                  Contact & Client Care
                </Link>
              </div>
            </nav>
          </div>

          {/* User Account / Auth */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              CLIENT ACCESS
            </p>
            {isAuthenticated && user ? (
              <div className="p-3.5 bg-[#FAF7F2] border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold font-mono">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-900">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-neutral-900 text-white px-2 py-0.5">
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal();
                    }}
                    className="flex-1 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-medium text-center hover:bg-black transition-colors"
                  >
                    Orders
                  </button>
                  <button
                    onClick={logout}
                    className="py-2 px-3 border border-neutral-300 text-neutral-600 hover:text-black hover:border-black text-[10px] uppercase tracking-widest font-medium flex items-center justify-center transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="block w-full py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-medium text-center hover:bg-black transition-colors"
                  >
                    Admin Console
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="w-full py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors flex items-center justify-center space-x-2"
              >
                <UserIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>SIGN IN / REGISTER</span>
              </button>
            )}
          </div>

          {/* Legal / Policy links */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
              POLICIES
            </p>
            <ul className="space-y-2 text-[11px] uppercase tracking-widest text-neutral-500">
              <li>
                <Link href="/shipping-and-delivery" onClick={onClose} className="hover:text-black transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/cancellation-and-refund" onClick={onClose} className="hover:text-black transition-colors">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" onClick={onClose} className="hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" onClick={onClose} className="hover:text-black transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="p-5 border-t border-neutral-200 bg-[#FAF7F2] space-y-2.5">
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-neutral-500">
            DIRECT INQUIRIES
          </p>
          <a
            href="mailto:info@amorecosmetics.in"
            className="flex items-center space-x-2.5 text-xs text-neutral-700 hover:text-black transition-colors"
          >
            <Mail className="w-3.5 h-3.5 stroke-[1.5] shrink-0 text-neutral-500" />
            <span className="truncate">info@amorecosmetics.in</span>
          </a>
          <a
            href="tel:+919558907807"
            className="flex items-center space-x-2.5 text-xs text-neutral-700 hover:text-black transition-colors"
          >
            <Phone className="w-3.5 h-3.5 stroke-[1.5] shrink-0 text-neutral-500" />
            <span>+91 9558907807</span>
          </a>
          <a
            href="https://instagram.com/amore_.cosmetic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 text-xs text-neutral-700 hover:text-black transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
            <span>@amore_.cosmetic</span>
          </a>
        </div>
      </div>
    </div>
  );
};
