"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, ArrowRight, Check } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-black text-white border-t border-neutral-800">
      {/* Brand Value Pillars */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              COSMETOLOGIST FORMULATED
            </p>
            <p className="text-[11px] text-neutral-400 tracking-wide">
              Developed by licensed cosmetic scientists
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              BLUEBERRY & AVOCADO
            </p>
            <p className="text-[11px] text-neutral-400 tracking-wide">
              Enriched with antioxidant fruit butters
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              100% VEGAN & CLEAN
            </p>
            <p className="text-[11px] text-neutral-400 tracking-wide">
              Cruelty-free • Non-toxic lip care
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              EXPRESS PAN-INDIA
            </p>
            <p className="text-[11px] text-neutral-400 tracking-wide">
              0–7 business days prompt delivery
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif tracking-[0.35em] text-white font-bold uppercase">
                AMORE
              </span>
              <span className="block text-[9px] tracking-[0.5em] text-neutral-400 uppercase -mt-0.5">
                COSMETICS
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed tracking-wide max-w-sm">
              Founded by two passionate cosmetologists, Amore was born from a desire to combine
              deeply hydrating skincare with high-impact color. Our signature Hydravelvet Lipstick
              delivers effortless elegance and all-day comfort.
            </p>
            <div className="space-y-2 pt-2 text-xs text-neutral-300">
              <a
                href="mailto:info@amorecosmetics.in"
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>info@amorecosmetics.in</span>
              </a>
              <a
                href="tel:+919558907807"
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>+91 9558907807</span>
              </a>
              <a
                href="https://instagram.com/amore_.cosmetic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                <span>@amore_.cosmetic</span>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 tracking-wider uppercase">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All 12 Shades
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=Everyday+Nudes"
                  className="hover:text-white transition-colors"
                >
                  Everyday Nudes
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=Bold+Colors"
                  className="hover:text-white transition-colors"
                >
                  Bold Colors
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=HydraCream+Series"
                  className="hover:text-white transition-colors"
                >
                  HydraCream Series
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & Policies */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              CLIENT CARE
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 tracking-wider uppercase">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-and-delivery"
                  className="hover:text-white transition-colors"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation-and-refund"
                  className="hover:text-white transition-colors"
                >
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
              NEWSLETTER
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed tracking-wide">
              Receive private previews of new shade formulations and editorial beauty notes.
            </p>
            {subscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-white" />
                <span>Thank you. You are now on the private guest list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex border border-neutral-700 focus-within:border-white transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    required
                    suppressHydrationWarning
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder:text-neutral-500 uppercase tracking-widest focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="px-4 bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  NO SPAM. UNSUBSCRIBE ANYTIME.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 tracking-wider space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} AMORE COSMETICS. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6">
            <span>SECURE ENCRYPTED CHECKOUT</span>
            <span>•</span>
            <span>AUTHENTIC GUARANTEED</span>
            <span>•</span>
            <span>MADE IN INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
