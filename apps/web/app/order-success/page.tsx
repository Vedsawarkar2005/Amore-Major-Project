"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Mail, Package, ArrowRight, Sparkles } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "CONFIRMED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-[#16A34A]" />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-[#A8A29E] mb-2 font-medium">
        Order Received & Confirmed
      </p>
      <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1917] mb-3">
        Thank You for Your Order
      </h1>
      <p className="text-sm text-[#78716C] max-w-md mx-auto mb-8">
        Your bespoke Amore Hydravelvet formulation is now in production at our atelier.
      </p>

      {/* Order Details Card */}
      <div className="bg-[#FAF9F6] border border-[#EAE8E4] p-6 text-left space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE8E4] pb-4 gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#857F77] font-semibold block">
              Order Reference
            </span>
            <span className="text-lg font-mono font-semibold text-[#1C1917]">
              #{orderId}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold rounded">
            <Check className="w-3.5 h-3.5" /> PAID & VERIFIED
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <Mail className="w-4 h-4 text-[#9E1B32] shrink-0 mt-0.5" />
          <div className="text-xs text-[#57534E]">
            <p className="font-semibold text-[#1C1917]">Luxury Invoice Dispatched</p>
            <p className="text-[#78716C] mt-0.5">
              An itemized HTML invoice rendered with React Email has been automatically
              dispatched via Resend to your registered email address.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Package className="w-4 h-4 text-[#9E1B32] shrink-0 mt-0.5" />
          <div className="text-xs text-[#57534E]">
            <p className="font-semibold text-[#1C1917]">Complimentary Express Courier</p>
            <p className="text-[#78716C] mt-0.5">
              Your order is carefully packaged with signature cold-pressed lip care
              accoutrements and dispatched within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/shop"
          className="w-full sm:w-auto px-6 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          Explore More Lipsticks <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/try-on"
          className="w-full sm:w-auto px-6 py-3.5 bg-white border border-[#EAE8E4] hover:bg-[#FAF9F6] text-[#1C1917] text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#9E1B32]" /> Launch Virtual Try-On
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-white py-12">
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-[#78716C] uppercase tracking-widest">
            Loading order confirmation...
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
