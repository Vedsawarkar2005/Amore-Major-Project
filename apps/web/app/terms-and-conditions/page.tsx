import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions – AMORE Cosmetics",
  description:
    "Read the terms, conditions, and user agreement governing your use of AMORE Cosmetics storefront and purchases.",
};

export default function TermsConditionsPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="border-b border-neutral-200 py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            LEGAL FRAMEWORK
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            TERMS & CONDITIONS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide">
            Please read these terms carefully before utilizing our e-commerce platform.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-sm text-neutral-700 leading-relaxed font-light tracking-wide">
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            1. ACCEPTANCE OF TERMS
          </h2>
          <p>
            By accessing or purchasing from <strong>amorecosmetics.in</strong>, you agree to be
            legally bound by these Terms and Conditions. If you do not agree to these terms, please
            discontinue use of our storefront immediately.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            2. PRODUCT PRICING & ACCURACY
          </h2>
          <p>
            All prices on our storefront are stated in Indian Rupees (INR) and are inclusive of all
            applicable statutory taxes. While we endeavor to ensure all shade descriptions,
            photographs, and pricing are accurate, minor color variations may occur depending on
            screen display calibrations and individual natural lip pigmentation.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            3. INTELLECTUAL PROPERTY
          </h2>
          <p>
            All trademarks, logos, visual photographs, product formulations, and editorial copy
            featured on this platform are the exclusive intellectual property of AMORE Cosmetics.
            Unauthorized reproduction, redistribution, or commercial exploitation is strictly
            prohibited.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            4. COSMETIC USAGE & PATCH TESTING
          </h2>
          <p>
            While our lipsticks are formulated by licensed cosmetologists to be gentle, non-toxic,
            and soothing with Blueberry Butter, Avocado Oil, and Vitamin E, individual skin
            sensitivities can vary. We recommend performing a simple patch test prior to initial
            application.
          </p>
        </div>

        <div className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            5. GOVERNING LAW
          </h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the
            laws of India. Any disputes arising hereunder shall be subject to the exclusive
            jurisdiction of the courts of India.
          </p>
        </div>
      </div>
    </div>
  );
}
