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
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 border-r border-neutral-200 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="text-lg font-bold tracking-[0.3em] uppercase text-black"
          >
            AMORE
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick-Access Action Grid (Try-On, Wishlist, Cart) */}
        <div className="grid grid-cols-3 border-b border-neutral-200 bg-neutral-50 text-center divide-x divide-neutral-200">
          <Link
            href="/try-on"
            onClick={onClose}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-white transition-colors group"
          >
            <Sparkles className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black">
              Try-On
            </span>
          </Link>

          <Link
            href="/wishlist"
            onClick={onClose}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-white transition-colors relative group"
          >
            <Heart className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black">
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="absolute top-2 right-4 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              onClose();
              openCart();
            }}
            className="p-3.5 flex flex-col items-center justify-center gap-1.5 hover:bg-white transition-colors relative group focus:outline-none"
          >
            <ShoppingBag className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black">
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute top-2 right-4 w-4 h-4 bg-black text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Primary Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              EXPERIENCE & SHOP
            </p>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/try-on"
                  onClick={onClose}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-black bg-neutral-100 hover:bg-neutral-200 p-3 rounded-lg flex items-center justify-between transition-colors border border-neutral-200"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>VIRTUAL TRY-ON STUDIO</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-sm font-medium uppercase tracking-[0.2em] text-black hover:text-neutral-500 flex items-center justify-between transition-colors pt-1"
                >
                  <span>SHOP ALL (12 SHADES)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </Link>
              </li>
              <li className="pl-3 border-l border-neutral-200 space-y-2.5">
                <Link
                  href="/shop?collection=Everyday+Nudes"
                  onClick={onClose}
                  className="block text-xs uppercase tracking-[0.15em] text-neutral-600 hover:text-black transition-colors"
                >
                  Everyday Nudes
                </Link>
                <Link
                  href="/shop?collection=Bold+Colors"
                  onClick={onClose}
                  className="block text-xs uppercase tracking-[0.15em] text-neutral-600 hover:text-black transition-colors"
                >
                  Bold Colors
                </Link>
                <Link
                  href="/shop?collection=HydraCream+Series"
                  onClick={onClose}
                  className="block text-xs uppercase tracking-[0.15em] text-neutral-600 hover:text-black transition-colors"
                >
                  HydraCream Series
                </Link>
              </li>
            </ul>
          </div>

          <hr className="border-neutral-200" />

          {/* Brand Pages */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              DISCOVER
            </p>
            <ul className="space-y-3 text-xs uppercase tracking-[0.2em]">
              <li>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="block text-neutral-800 hover:text-black font-medium transition-colors"
                >
                  OUR STORY & FORMULATION
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  onClick={onClose}
                  className="block text-neutral-800 hover:text-black font-medium transition-colors"
                >
                  CONTACT & CLIENT CARE
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between text-neutral-800 hover:text-black font-medium transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Heart className="w-3.5 h-3.5" />
                    <span>SAVED SHADES</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center font-mono">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>


          <hr className="border-neutral-200" />

          {/* User Account / Auth */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              CLIENT ACCESS
            </p>
            {isAuthenticated && user ? (
              <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold font-mono">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-black text-white px-1.5 py-0.5">
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      openAuthModal();
                    }}
                    className="flex-1 py-1.5 bg-black text-white text-[10px] uppercase tracking-wider font-medium text-center"
                  >
                    Orders
                  </button>
                  <button
                    onClick={logout}
                    className="py-1.5 px-3 border border-neutral-300 text-neutral-600 hover:text-black text-[10px] uppercase tracking-wider font-medium flex items-center justify-center"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="w-full py-2.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>SIGN IN / REGISTER</span>
              </button>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* Legal / Policy links */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              POLICIES
            </p>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider text-neutral-500">
              <li>
                <Link href="/shipping-and-delivery" onClick={onClose} className="hover:text-black">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/cancellation-and-refund" onClick={onClose} className="hover:text-black">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" onClick={onClose} className="hover:text-black">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" onClick={onClose} className="hover:text-black">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-500">
            DIRECT INQUIRIES
          </p>
          <a
            href="mailto:info@amorecosmetics.in"
            className="flex items-center space-x-2 text-xs text-neutral-800 hover:text-black transition-colors"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">info@amorecosmetics.in</span>
          </a>
          <a
            href="tel:+919558907807"
            className="flex items-center space-x-2 text-xs text-neutral-800 hover:text-black transition-colors"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>+91 9558907807</span>
          </a>
          <a
            href="https://instagram.com/amore_.cosmetic"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-xs text-neutral-800 hover:text-black transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
            <span>@amore_.cosmetic</span>
          </a>
        </div>
      </div>
    </div>
  );
};
