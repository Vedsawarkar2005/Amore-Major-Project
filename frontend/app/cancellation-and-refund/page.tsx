import React from "react";
import type { Metadata } from "next";
import { AlertCircle, Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy – AMORE Cosmetics",
  description:
    "Review our 15-day return and refund policy, cancellation procedures, and cosmetic hygiene guidelines.",
};

export default function CancellationRefundPage() {
  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header */}
      <div className="border-b border-neutral-200 py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            GUARANTEE & RETURNS
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            CANCELLATION & REFUND
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide">
            Clear, transparent guidelines designed to protect both our clients and cosmetic safety
            standards.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-sm text-neutral-700 leading-relaxed font-light tracking-wide">
        {/* Highlight Callout Box */}
        <div className="p-6 border border-neutral-200 bg-neutral-50 flex items-start space-x-4">
          <AlertCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              15-DAY SATISFACTION WINDOW
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We offer a 15-day return and replacement policy for any lipstick that arrives damaged,
              broken, leaking, or incorrectly delivered. Please keep the original packaging intact.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            1. ORDER CANCELLATIONS
          </h2>
          <p>
            You may request an immediate cancellation of your order prior to package dispatch. To
            cancel, please contact our support team at{" "}
            <a href="mailto:info@amorecosmetics.in" className="text-black font-medium underline">
              info@amorecosmetics.in
            </a>{" "}
            or via phone/WhatsApp at <strong>+91 9558907807</strong> with your Order ID.
          </p>
          <p>
            Once an order has been picked and handed over to our courier partner (dispatched), it
            cannot be cancelled.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            2. ELIGIBILITY FOR RETURNS & REPLACEMENTS
          </h2>
          <p>
            Returns and complimentary replacements are granted exclusively under the following
            qualifying conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>The lipstick bullet or mechanical casing was broken/damaged in transit.</li>
            <li>The received shade does not match the shade listed on your order confirmation.</li>
            <li>The product exhibits manufacturing defects or missing items.</li>
          </ul>
        </div>

        {/* Section 3: The Unboxing Video Requirement */}
        <div className="p-6 border border-black space-y-3 bg-white">
          <div className="flex items-center space-x-2 text-black">
            <Video className="w-5 h-5" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">
              MANDATORY UNBOXING VIDEO REQUIREMENT
            </h3>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Due to the nature of personal cosmetic products, we require clients to record a clear,
            unedited unboxing video starting from the sealed outer shipping package showing the
            shipping label, opening of the box, and examination of the lipstick. This video must be
            sent to <strong>info@amorecosmetics.in</strong> within 48 hours of delivery to process
            claims.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            3. COSMETIC HYGIENE EXCLUSIONS
          </h2>
          <p>
            In compliance with national cosmetics and health safety regulations, any product that has
            been opened, swatched, used, or altered cannot be returned or refunded unless a verified
            manufacturing defect exists.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            4. REFUND REVERSAL TIMELINE
          </h2>
          <p>
            Once your return is received and inspected at our quality verification center, an
            approval email will be issued. Approved refunds are processed back to the original payment
            source (Debit/Credit Card, UPI, Net Banking) within <strong>5 to 7 business days</strong>.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3 border-t border-neutral-200 pt-8">
          <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-black">
            NEED ASSISTANCE?
          </h2>
          <p>
            For any return or cancellation queries, write directly to our client concierge at{" "}
            <strong>info@amorecosmetics.in</strong> or speak with us at <strong>+91 9558907807</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
