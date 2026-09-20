import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – AMORE Cosmetics",
  description:
    "Review how AMORE Cosmetics collects, safeguards, and respects your personal and payment information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="border-b border-neutral-200 py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            TRANSPARENCY & TRUST
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide">
            Your privacy is of paramount importance to AMORE Cosmetics.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-sm text-neutral-700 leading-relaxed font-light tracking-wide">
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            1. INFORMATION WE COLLECT
          </h2>
          <p>
            When you purchase from our storefront or register an account, we collect personal
            information necessary to fulfill your order, including your name, shipping address,
            billing address, email address, and contact telephone number.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            2. PAYMENT SECURITY & ENCRYPTION
          </h2>
          <p>
            AMORE Cosmetics does not store or process payment card details or banking passwords on
            our servers. All transactions are securely handled through industry-standard, PCI-DSS
            compliant payment gateways utilizing 256-bit SSL encryption.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            3. HOW WE USE YOUR INFORMATION
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>Processing, packing, and dispatching your cosmetic orders.</li>
            <li>Sending SMS and email tracking notifications for courier transit.</li>
            <li>Providing responsive customer support and addressing inquiries.</li>
            <li>Sending exclusive product release notes (only if opted in).</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            4. THIRD-PARTY SHARING
          </h2>
          <p>
            We never sell, rent, or trade your personal information. Data is shared exclusively with
            trusted logistics partners (to enable doorstep delivery) and payment gateways (to verify
            authorized transactions).
          </p>
        </div>

        <div className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            5. CONTACT OUR DATA OFFICER
          </h2>
          <p>
            If you wish to access, rectify, or delete any personal data we hold about you, please
            contact us at <strong>info@amorecosmetics.in</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
