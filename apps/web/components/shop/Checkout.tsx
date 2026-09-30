"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Checkout: React.FC = () => {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    orderNotes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty", {
        description: "Add shades from our Hydravelvet collection before placing an order.",
      });
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim()) {
      toast.error("Missing Shipping Details", {
        description: "Please fill in your name, email, and delivery address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = `${formData.fullName}, ${formData.address}, ${formData.city} - ${formData.pincode} (Tel: ${formData.phone})`;

      const orderItemsPayload = items.map((it) => {
        const numericId =
          parseInt(it.product.id.toString().replace(/\D/g, "")) || 1;
        return {
          product_id: numericId,
          quantity: it.quantity,
          price: it.product.price,
          name: it.product.name,
          shade_name: it.product.shade_name,
        };
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id || "demo-guest-customer",
            total_amount: subtotal,
            customer_name: formData.fullName,
            customer_email: formData.email,
            shipping_address: shippingAddress,
            items: orderItemsPayload,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      const confirmedOrderId = data.order_id || data.order?.id || "NEW";

      // Clear shopping cart
      clearCart();

      toast.success("Order Placed Successfully", {
        description: `Order #${confirmedOrderId} confirmed. Atelier receipt dispatched to ${formData.email}.`,
      });

      // Redirect user to Thank You confirmation page
      router.push(`/order-success?order_id=${confirmedOrderId}`);
    } catch (err: any) {
      console.error("[Checkout] Order confirmation error:", err);
      toast.error("Unable to Place Order", {
        description: err.message || "Please check your details and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#EAE8E4] flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7 text-[#78716C]" />
        </div>
        <h2 className="text-2xl font-serif text-[#1C1917] mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-[#78716C] max-w-sm mb-6">
          Explore our signature velvet matte formulations and find your bespoke shade.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white text-xs uppercase tracking-widest hover:bg-[#292524] transition-colors"
        >
          Discover Hydravelvet Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <div className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#78716C] hover:text-[#1C1917] transition-colors mb-3"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Boutique
        </Link>
        <h1 className="text-3xl lg:text-4xl font-serif text-[#1C1917]">
          Atelier Checkout
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#A8A29E] mt-1">
          Complimentary Express Delivery & Luxury Packaging Included
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Shipping & Client Details Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmitOrder}
            className="bg-white border border-[#EAE8E4] p-6 lg:p-8 space-y-6"
          >
            <div>
              <h2 className="text-lg font-serif text-[#1C1917] mb-1">
                Client & Delivery Details
              </h2>
              <p className="text-xs text-[#78716C]">
                Your invoice and shipment tracking will be dispatched to this address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aanya Sharma"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aanya@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Apartment, suite, building, street"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                  City / Town *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-medium text-[#44403C]">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F5F5F4] flex items-center justify-between text-xs text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Instant Order Confirmation
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#A8A29E]" /> Neon PostgreSQL Encrypted
              </span>
            </div>

            {/* Direct Order Confirmation Button (No Payment Gateway Dialogs) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-white text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Confirming Order &
                  Generating Invoice...
                </>
              ) : (
                <>
                  Confirm Order · {formatINR(subtotal)} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF9F6] border border-[#EAE8E4] p-6 lg:p-8 space-y-5">
            <h2 className="text-base font-serif text-[#1C1917] border-b border-[#EAE8E4] pb-3">
              Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
            </h2>

            {/* Itemized List */}
            <div className="divide-y divide-[#EAE8E4] max-h-72 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.product.id} className="py-3.5 flex items-center gap-4">
                  {it.product.image_url ? (
                    <div className="relative w-12 h-14 bg-white border border-[#EAE8E4] shrink-0 overflow-hidden">
                      <Image
                        src={it.product.image_url}
                        alt={it.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full shrink-0 border border-black/10 shadow-inner"
                      style={{ backgroundColor: it.product.shade_hex || "#9E1B32" }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-[#1C1917] truncate">
                      {it.product.name}
                    </h3>
                    <p className="text-[11px] text-[#78716C]">
                      Shade: {it.product.shade_name} · Qty: {it.quantity}
                    </p>
                  </div>

                  <div className="text-xs font-medium text-[#1C1917]">
                    {formatINR(it.product.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#EAE8E4] space-y-2 text-xs">
              <div className="flex justify-between text-[#78716C]">
                <span>Bag Subtotal</span>
                <span className="text-[#1C1917] font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#78716C]">
                <span>Express Courier Shipping</span>
                <span className="text-[#B45309] font-medium tracking-wide uppercase">
                  Complimentary
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAE8E4] flex justify-between text-sm font-semibold text-[#1C1917]">
                <span>Total Amount</span>
                <span className="font-serif text-base">{formatINR(subtotal)}</span>
              </div>
            </div>

            {/* Atelier Guarantee */}
            <div className="bg-white/80 p-3.5 border border-[#EAE8E4] text-[11px] text-[#78716C] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                <Sparkles className="w-3.5 h-3.5 text-[#9E1B32]" /> Amore Formulation Guarantee
              </div>
              <p>
                Enriched with natural Blueberry Butter, Avocado Oil, and Vitamin E.
                Freshly dispatched in signature luxury gift-wrapping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
