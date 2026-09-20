"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Leaf } from "lucide-react";
import { products, Product } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { formatINR } from "@/lib/utils";
import gsap from "gsap";

export default function HomePage() {
  const [activeSpectrumShade, setActiveSpectrumShade] = useState<Product>(products[0]);
  const featuredShades = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);

  // GSAP Hero animation refs
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroMetricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [
      heroBadgeRef.current,
      heroHeadingRef.current,
      heroSubRef.current,
      heroCtaRef.current,
      heroMetricsRef.current,
    ].filter(Boolean);

    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.13,
        clearProps: "transform,opacity,visibility",
      }
    );
  }, []);

  return (
    <div className="bg-white text-black">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative border-b border-neutral-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div
              ref={heroBadgeRef}
              className="inline-flex items-center space-x-2 border border-neutral-300 px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-medium text-neutral-600"
            >
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
              <span>THE HYDRAVELVET COLLECTION</span>
            </div>

            <h1
              ref={heroHeadingRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight font-medium uppercase leading-[1.1]"
            >
              A VEIL OF CARE, <br />
              <span className="italic font-light">A TOUCH OF COLOUR.</span>
            </h1>

            <p
              ref={heroSubRef}
              className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed max-w-xl tracking-wide"
            >
              Infused with nourishing <strong>Blueberry Butter</strong>, protective{" "}
              <strong>Avocado Oil</strong>, and <strong>Vitamin E</strong>. Formulated by licensed
              cosmetologists to deliver a featherweight velvet finish with all-day moisture.
            </p>

            {/* Price tag & CTA buttons */}
            <div ref={heroCtaRef} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-3 shadow-sm"
              >
                <span>EXPLORE ALL 12 SHADES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 border border-black text-black text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-100 transition-colors flex items-center justify-center text-center"
              >
                THE FORMULATION
              </Link>
            </div>

            {/* Key Assurance Metrics */}
            <div ref={heroMetricsRef} className="pt-8 border-t border-neutral-100 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-lg font-semibold font-serif">12</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                  Velvet Shades
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold font-serif">₹349</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                  All Inclusive
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold font-serif">100%</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                  Vegan &amp; Clean
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 w-full bg-neutral-100 border border-neutral-200 overflow-hidden shadow-sm">
              <Image
                src={products[0].image_url}
                alt="Hydravelvet Lipstick by Amore"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain p-6 hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs border border-neutral-200 p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: products[0].shade_hex }}
                    />
                    <p className="text-xs font-semibold uppercase tracking-wider text-black">
                      {products[0].shade_name}
                    </p>
                  </div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">
                    Signature Shade • {products[0].sku}
                  </p>
                </div>
                <Link
                  href={`/shop/${products[0].slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-black underline hover:opacity-70 flex items-center space-x-1"
                >
                  <span>VIEW</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE EDITORIAL BRAND STORY */}
      <section className="py-20 lg:py-28 border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            THE PHILOSOPHY
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light uppercase tracking-tight text-black">
            TWO COSMETOLOGISTS. <br />
            <span className="font-normal italic">ONE BEAUTIFUL IDEA.</span>
          </h2>
          <div className="w-12 h-px bg-black mx-auto my-6" />
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-light tracking-wide max-w-2xl mx-auto">
            &ldquo;AMORE was born not from a boardroom, but from the treatment room. As practicing
            cosmetologists, we watched clients constantly balance the vibrancy of matte lipsticks with
            the inevitable dryness and flaking that followed. We created Hydravelvet to eliminate that
            compromise forever.&rdquo;
          </p>
          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-[0.25em] text-black border-b border-black pb-1 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
            >
              <span>READ OUR COMPLETE STORY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE SELECTIONS (4 FEATURED PRODUCTS) */}
      <section className="py-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-1">
                CURATED PICKS
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium uppercase tracking-tight">
                SIGNATURE SHADES
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 text-xs font-medium uppercase tracking-[0.2em] text-black hover:underline"
            >
              <span>VIEW ALL 12 LIPSTICKS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredShades.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SHADE SPECTRUM (ALL 12 SHADES) */}
      <section className="py-20 border-b border-neutral-200 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              THE FULL PALETTE
            </p>
            <h2 className="text-3xl font-serif uppercase tracking-tight">
              INTERACTIVE SHADE SPECTRUM
            </h2>
            <p className="text-xs text-neutral-400 tracking-wide font-light">
              Select any swatch below to reveal its shade profile, undertones, and formula characteristics.
            </p>
          </div>

          {/* Interactive Spectrum Bar */}
          <div className="flex justify-center flex-wrap gap-2.5 sm:gap-4 mb-12 max-w-3xl mx-auto">
            {products.map((shade) => {
              const isActive = shade.id === activeSpectrumShade.id;
              return (
                <button
                  key={shade.id}
                  onClick={() => setActiveSpectrumShade(shade)}
                  className={`group relative p-1 transition-all focus:outline-none ${
                    isActive ? "scale-125" : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Inspect ${shade.shade_name}`}
                >
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full block border-2 transition-all ${
                      isActive ? "border-white shadow-lg" : "border-neutral-700"
                    }`}
                    style={{ backgroundColor: shade.shade_hex }}
                  />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {shade.shade_name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Shade Spotlight Card */}
          <div className="max-w-4xl mx-auto bg-neutral-950 border border-neutral-800 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 relative aspect-square bg-neutral-900 border border-neutral-800 overflow-hidden">
              <Image
                src={activeSpectrumShade.image_url}
                alt={activeSpectrumShade.name}
                fill
                sizes="(max-width: 768px) 100vw, 350px"
                className="object-contain p-6"
              />
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center space-x-3">
                <span
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: activeSpectrumShade.shade_hex }}
                />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">
                  {activeSpectrumShade.sku} • {activeSpectrumShade.collection}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif uppercase tracking-tight text-white">
                {activeSpectrumShade.name}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed font-light tracking-wide">
                {activeSpectrumShade.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                <span className="text-lg font-semibold text-white">
                  {formatINR(activeSpectrumShade.price)}
                </span>
                <Link
                  href={`/shop/${activeSpectrumShade.slug}`}
                  className="px-6 py-3 bg-white text-black text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors flex items-center space-x-2"
                >
                  <span>SHOP THIS SHADE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTANICAL SCIENCE & INGREDIENT HIGHLIGHTS */}
      <section className="py-20 lg:py-28 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
              CELLULAR LIP CARE
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif uppercase tracking-tight">
              KEY BOTANICAL ACTIVES
            </h2>
            <p className="text-xs text-neutral-600 tracking-wide font-light">
              We selected pure botanical lipid carriers to comfort, nourish, and protect against dry lips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Actives 1 */}
            <div className="p-8 border border-neutral-200 space-y-4 hover:border-black transition-colors">
              <div className="w-10 h-10 border border-black flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                BLUEBERRY BUTTER
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
                Naturally rich in polyphenols and anthocyanin antioxidants. Blueberry butter comforts and
                shields lips against environmental stressors while imparting velvety suppleness.
              </p>
            </div>

            {/* Actives 2 */}
            <div className="p-8 border border-neutral-200 space-y-4 hover:border-black transition-colors">
              <div className="w-10 h-10 border border-black flex items-center justify-center">
                <Leaf className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                AVOCADO OIL & SHEA
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
                Packed with essential oleic fatty acids and bio-identical sterols. Penetrates deep into lip
                epidermis to prevent moisture loss and restore silky elasticity.
              </p>
            </div>

            {/* Actives 3 */}
            <div className="p-8 border border-neutral-200 space-y-4 hover:border-black transition-colors">
              <div className="w-10 h-10 border border-black flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
                VITAMIN E (TOCOPHEROL)
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
                A potent anti-free-radical lipid shield. Vitamin E accelerates skin barrier regeneration,
                preventing premature cracking and flaking throughout long daily wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS GRID */}
      <section className="py-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-1">
                EVERYDAY WEAR
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium uppercase tracking-tight">
                MORE HIGH-VELVET SHADES
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 text-xs font-medium uppercase tracking-[0.2em] text-black hover:underline"
            >
              <span>DISCOVER ALL TONES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. EDITORIAL CLOSING CALL TO ACTION */}
      <section className="py-24 bg-neutral-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            EFFORTLESS ELEGANCE
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif uppercase tracking-tight">
            DISCOVER YOUR VELVET FINISH
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-xl mx-auto tracking-wide">
            Each shade is hand-selected and balanced to flatter diverse Indian skin tones. Experience
            the fusion of clean beauty and clinical care.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-3 px-10 py-4 bg-white text-black text-xs font-semibold uppercase tracking-[0.25em] hover:bg-neutral-200 transition-colors shadow-lg"
            >
              <span>SHOP THE FULL COLLECTION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
