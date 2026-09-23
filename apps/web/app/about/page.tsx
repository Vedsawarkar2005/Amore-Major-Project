import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, HeartHandshake, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story – AMORE Cosmetics",
  description:
    "Founded by two passionate cosmetologists, Amore was born to unite nourishing skincare with luxurious color payoff.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Editorial Header */}
      <section className="border-b border-neutral-200 py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            THE AMORE HERITAGE
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light uppercase tracking-tight">
            TWO COSMETOLOGISTS. <br />
            <span className="font-normal italic">ONE BEAUTIFUL IDEA.</span>
          </h1>
          <div className="w-12 h-px bg-black mx-auto my-6" />
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed tracking-wide">
            Where dermatological science meets high-fashion color aesthetics.
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
        {/* Narrative Paragraphs */}
        <div className="space-y-6 text-sm sm:text-base text-neutral-700 leading-relaxed font-light tracking-wide">
          <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-black">
            At AMORE, we believe that makeup should be more than just a surface touch; it should
            care for what lies beneath. As practicing cosmetologists, we saw first-hand how many lip
            products delivered stunning color at the cost of chronic dryness, irritation, and
            discomfort.
          </p>
          <p>
            The cosmetics industry has long forced women to make a compromise: either accept
            chalky, drying liquid lipsticks for long wear, or opt for balms that sacrifice pigment
            and structure. We knew that through disciplined formulation and clean lipid chemistry,
            this compromise could be eliminated.
          </p>
          <p>
            That is why we created <strong>Hydravelvet Lipstick</strong> — an exquisite union of
            featherweight, velvet-matte pigment and high-potency skin-nourishing botanicals:
            antioxidant-rich <strong>Blueberry Butter</strong>, barrier-restoring{" "}
            <strong>Avocado Oil</strong>, and protective <strong>Vitamin E</strong>.
          </p>
        </div>

        {/* The Amore Pillars */}
        <div className="border-y border-neutral-200 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="w-8 h-8 border border-black flex items-center justify-center">
              <Award className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
              COSMETOLOGIST-LED FORMULATION
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Every formula is guided by licensed cosmetic professionals who understand the
              physiology of lip skin, which lacks sebaceous glands and requires dedicated barrier
              protection.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 border border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
              SUPERFRUIT BUTTERS & BOTANICALS
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              We replace cheap mineral fillers with pure Blueberry Butter, Shea Butter, Sweet
              Almond Oil, and refined waxes that cushion lips with continuous moisture.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 border border-black flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
              100% CLEAN & HARMLESS
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Gentle, safe, and non-toxic. We adhere to rigorous dermatological safety principles,
              ensuring formulas that soothe sensitive lips without stinging or parching.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 border border-black flex items-center justify-center">
              <HeartHandshake className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
              CURATED FOR DIVERSE UNDERTONES
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              Our 12 shades were calibrated across warm, neutral, and cool Indian undertones — from
              delicate nudes like Barely Chestnut to bold power shades like Wine Stain.
            </p>
          </div>
        </div>

        {/* Founders' Note Box */}
        <div className="p-8 sm:p-12 bg-neutral-50 border border-neutral-200 text-center space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            A PERSONAL PROMISE
          </p>
          <blockquote className="text-base sm:text-lg font-serif italic text-black max-w-xl mx-auto leading-relaxed">
            &ldquo;Our mission is simple: to bring you clean, cruelty-free, high-performance beauty
            that feels as good as it looks. Thank you for welcoming Amore into your everyday
            ritual.&rdquo;
          </blockquote>
          <p className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-800 pt-2">
            THE FOUNDERS & COSMETOLOGISTS • AMORE
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors"
          >
            <span>EXPERIENCE THE COLLECTION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
