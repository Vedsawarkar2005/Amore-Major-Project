import React from "react";
import type { Metadata } from "next";
import { Truck, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy – AMORE Cosmetics",
  description:
    "Learn about our shipping timelines, domestic pan-India delivery, packaging standards, and tracking protocols.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header */}
      <div className="border-b border-neutral-200 py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            POLICIES & TRANSIT
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            SHIPPING & DELIVERY
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide">
            Prompt, secure, pan-India fulfillment direct from our cosmetic laboratories.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-sm text-neutral-700 leading-relaxed font-light tracking-wide">
        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-neutral-200 p-6 bg-neutral-50">
          <div className="space-y-2">
            <Clock className="w-5 h-5 text-black" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              24-48 HR DISPATCH
            </h4>
            <p className="text-[11px] text-neutral-600">
              Orders processed promptly Monday through Saturday.
            </p>
          </div>
          <div className="space-y-2">
            <Truck className="w-5 h-5 text-black" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              0–7 BUSINESS DAYS
            </h4>
            <p className="text-[11px] text-neutral-600">
              Standard domestic delivery across all serviceable Indian pincodes.
            </p>
          </div>
          <div className="space-y-2">
            <ShieldCheck className="w-5 h-5 text-black" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              SECURE PACKAGING
            </h4>
            <p className="text-[11px] text-neutral-600">
              Protected in temperature-stable, tamper-evident outer boxes.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            1. ORDER PROCESSING & DISPATCH
          </h2>
          <p>
            At AMORE Cosmetics, all orders are processed with meticulous care. Each lipstick is
            visually inspected before dispatch. Orders placed before 12:00 PM IST on business days
            (Monday through Saturday) are typically queued for dispatch within 24 to 48 hours. Orders
            placed on Sundays or national holidays are fulfilled on the next business day.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            2. DELIVERY TIMELINES & COVERAGE
          </h2>
          <p>
            We ship nationwide across India. Depending on your delivery address, transit timelines
            range between <strong>0 to 7 business days</strong> from the moment of dispatch:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>Metro Cities & Major Hubs: 2 to 4 business days</li>
            <li>Tier 2 & Tier 3 Cities: 3 to 6 business days</li>
            <li>Special Regions / Remote Pincodes: Up to 7 business days</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            3. REAL-TIME TRACKING
          </h2>
          <p>
            As soon as your shipment is handed over to our logistics partner, you will receive an
            automated confirmation via email and SMS containing your airway bill (AWB) number and a
            direct tracking link. You can track your package every step of the journey.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            4. DAMAGED OR TAMPERED DELIVERIES
          </h2>
          <p>
            If your outer parcel arrives visibly crushed, opened, or tampered with at the time of
            delivery, please <strong>refuse delivery</strong> and ask the courier to mark it as
            &ldquo;Damaged in Transit.&rdquo; Alternatively, record an unboxing video upon receiving
            the package and contact our concierge at{" "}
            <a href="mailto:info@amorecosmetics.in" className="text-black font-medium underline">
              info@amorecosmetics.in
            </a>{" "}
            within 48 hours.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            CLIENT ASSISTANCE
          </h2>
          <p>
            If you have any specific delivery instructions or need to update your address before
            dispatch, please contact us immediately at <strong>+91 9558907807</strong> or email{" "}
            <strong>info@amorecosmetics.in</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
