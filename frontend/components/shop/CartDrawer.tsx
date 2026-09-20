"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  MapPin,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "@/components/ui/sonner";

const FREE_SHIPPING_THRESHOLD = 698; // 2 Lipsticks unlock complimentary express shipping

// Zod Validation Schemas for Multi-Step Checkout
const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required (min 2 characters)"),
  address: z.string().trim().min(5, "Delivery address required (min 5 characters)"),
  city: z.string().trim().min(2, "City is required"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Must be a valid 6-digit Indian Pincode"),
});

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^\d{16}$/.test(val), {
      message: "Enter a valid 16-digit card number",
    }),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Enter MM/YY (e.g. 12/28)"),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3}$/, "Enter 3-digit CVV"),
});

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  // Multi-step state: "cart" -> "shipping" -> "payment"
  const [step, setStep] = useState<"cart" | "shipping" | "payment">("cart");
  const [isProcessing, setIsProcessing] = useState(false);

  // TanStack Form configuration
  const checkoutForm = useForm({
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      pincode: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
    onSubmit: async ({ value }) => {
      // Validate payment step
      const payResult = paymentSchema.safeParse({
        cardNumber: value.cardNumber,
        expiry: value.expiry,
        cvv: value.cvv,
      });

      if (!payResult.success) {
        toast.error("Payment Details Invalid", {
          description: payResult.error.issues[0]?.message || "Please check card details.",
        });
        return;
      }

      setIsProcessing(true);

      // Simulate payment gateway authorization delay
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const orderNumber = Math.floor(100000 + Math.random() * 900000);

      // Clear user's cart
      clearCart();

      // Trigger success notification
      toast.success("Order Placed Successfully", {
        description: `Order #AM-${orderNumber} confirmed. Total: ${formatINR(
          subtotal
        )}. Confirmation dispatched to ${value.fullName}.`,
      });

      // Reset state and close drawer
      setIsProcessing(false);
      setStep("cart");
      checkoutForm.reset();
      closeCart();
    },
  });

  // Handle escape key & overflow locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
        setStep("cart");
      }
    };

    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      setStep("cart");
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const freeShippingDifference = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Validate step 1 before proceeding to step 2
  const handleProceedToPayment = () => {
    const currentValues = checkoutForm.state.values;
    const shippingResult = shippingSchema.safeParse({
      fullName: currentValues.fullName,
      address: currentValues.address,
      city: currentValues.city,
      pincode: currentValues.pincode,
    });

    if (!shippingResult.success) {
      checkoutForm.setFieldMeta("fullName", (prev) => ({ ...prev, isTouched: true }));
      checkoutForm.setFieldMeta("address", (prev) => ({ ...prev, isTouched: true }));
      checkoutForm.setFieldMeta("city", (prev) => ({ ...prev, isTouched: true }));
      checkoutForm.setFieldMeta("pincode", (prev) => ({ ...prev, isTouched: true }));

      toast.error("Shipping Incomplete", {
        description:
          shippingResult.error.issues[0]?.message || "Please complete all shipping details.",
      });
      return;
    }

    setStep("payment");
  };

  const handleFillTestCard = () => {
    checkoutForm.setFieldValue("cardNumber", "4532 8219 9201 1029");
    checkoutForm.setFieldValue("expiry", "12/28");
    checkoutForm.setFieldValue("cvv", "882");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Dark Backdrop */}
      <div
        onClick={() => {
          closeCart();
          setStep("cart");
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 border-l border-neutral-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {step !== "cart" && (
              <button
                onClick={() => setStep(step === "payment" ? "shipping" : "cart")}
                className="p-1 -ml-1 text-black hover:text-neutral-500 transition-colors focus:outline-none"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-black">
              {step === "cart" && `SHOPPING BAG (${totalItems})`}
              {step === "shipping" && "CHECKOUT • 1/2 SHIPPING"}
              {step === "payment" && "CHECKOUT • 2/2 PAYMENT"}
            </h2>
          </div>
          <button
            onClick={() => {
              closeCart();
              setStep("cart");
            }}
            aria-label="Close cart"
            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STEP 0: CART BAG REVIEW */}
        {/* ========================================================================= */}
        {step === "cart" && (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="px-5 py-3.5 bg-neutral-50 border-b border-neutral-200">
              <p className="text-xs tracking-wider text-neutral-800 uppercase font-medium mb-2">
                {freeShippingDifference <= 0 ? (
                  <span className="text-black font-semibold">
                    ✓ COMPLIMENTARY EXPRESS SHIPPING UNLOCKED
                  </span>
                ) : (
                  <span>
                    ADD <strong className="text-black">{formatINR(freeShippingDifference)}</strong>{" "}
                    MORE FOR FREE EXPRESS SHIPPING
                  </span>
                )}
              </p>
              <div className="w-full h-1 bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-16 h-16 border border-neutral-200 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-neutral-400" />
                  </div>
                  <h3 className="text-base font-medium tracking-[0.15em] uppercase text-black mb-1">
                    YOUR BAG IS EMPTY
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mb-6 tracking-wide leading-relaxed">
                    Discover our luxurious 12-shade Hydravelvet Lipstick collection, crafted by
                    cosmetologists.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition-colors"
                  >
                    DISCOVER HYDRAVELVET
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Link>
                </div>
              ) : (
                items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 first:pt-0 flex gap-4">
                    {/* Product Thumbnail */}
                    <div className="relative w-20 h-24 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/shop/${product.slug}`}
                            onClick={closeCart}
                            className="text-xs font-semibold uppercase tracking-wider text-black hover:underline line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-neutral-400 hover:text-black p-0.5 transition-colors"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Shade swatch and SKU */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-300 shrink-0"
                            style={{ backgroundColor: product.shade_hex }}
                            aria-hidden="true"
                          />
                          <span className="text-[11px] text-neutral-600 tracking-wider uppercase truncate">
                            {product.shade_name} • {product.sku}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-black mt-1">
                          {formatINR(product.price)}
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-3 pt-2">
                        <div className="flex items-center border border-neutral-300">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-medium text-black min-w-[28px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-black tracking-wide">
                          {formatINR(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-200 bg-white space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs tracking-wider uppercase text-neutral-600">
                    <span>SUBTOTAL</span>
                    <span className="text-sm font-semibold text-black">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-neutral-500">
                    <span>SHIPPING</span>
                    <span>
                      {freeShippingDifference <= 0 ? "FREE" : "CALCULATED AT CHECKOUT"}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 tracking-wide uppercase pt-1">
                    ALL TAXES INCLUDED • 15-DAY SATISFACTION GUARANTEE
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setStep("shipping")}
                    className="w-full py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-neutral-500">
                    <button
                      onClick={clearCart}
                      className="underline hover:text-black tracking-wider uppercase cursor-pointer"
                    >
                      Clear Bag
                    </button>
                    <button
                      onClick={() => {
                        closeCart();
                        setStep("cart");
                      }}
                      className="underline hover:text-black tracking-wider uppercase cursor-pointer"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SHIPPING DETAILS (TanStack Form + Zod) */}
        {/* ========================================================================= */}
        {step === "shipping" && (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-6 space-y-6">
              {/* Order quick overview */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <span className="text-neutral-600 uppercase tracking-wider">
                  TOTAL ({totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"})
                </span>
                <span className="font-semibold text-black font-mono">{formatINR(subtotal)}</span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-3">
                <span className="font-semibold text-black flex items-center space-x-1">
                  <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[9px] font-mono">
                    1
                  </span>
                  <span>SHIPPING DETAILS</span>
                </span>
                <span>→</span>
                <span className="flex items-center space-x-1 text-neutral-400">
                  <span className="w-4 h-4 border border-neutral-300 flex items-center justify-center text-[9px] font-mono">
                    2
                  </span>
                  <span>PAYMENT</span>
                </span>
              </div>

              {/* Shipping Form Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <checkoutForm.Field
                  name="fullName"
                  validators={{
                    onChange: ({ value }) => {
                      const res = z
                        .string()
                        .trim()
                        .min(2, "Full name required (min 2 characters)")
                        .safeParse(value);
                      return !res.success ? res.error.issues[0]?.message : undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                          FULL NAME *
                        </label>
                        <input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="RECIPIENT NAME"
                          className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 ${
                            hasError
                              ? "border-red-600 bg-red-50/20"
                              : "border-neutral-300 focus:border-black"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </checkoutForm.Field>

                {/* Delivery Address */}
                <checkoutForm.Field
                  name="address"
                  validators={{
                    onChange: ({ value }) => {
                      const res = z
                        .string()
                        .trim()
                        .min(5, "Delivery address required (min 5 characters)")
                        .safeParse(value);
                      return !res.success ? res.error.issues[0]?.message : undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                          DELIVERY ADDRESS *
                        </label>
                        <textarea
                          rows={3}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="STREET ADDRESS, FLAT, BUILDING, LOCALITY"
                          className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 ${
                            hasError
                              ? "border-red-600 bg-red-50/20"
                              : "border-neutral-300 focus:border-black"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </checkoutForm.Field>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <checkoutForm.Field
                    name="city"
                    validators={{
                      onChange: ({ value }) => {
                        const res = z.string().trim().min(2, "City is required").safeParse(value);
                        return !res.success ? res.error.issues[0]?.message : undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const hasError =
                        field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                      return (
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                            CITY / TOWN *
                          </label>
                          <input
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="MUMBAI"
                            className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 ${
                              hasError
                                ? "border-red-600 bg-red-50/20"
                                : "border-neutral-300 focus:border-black"
                            }`}
                          />
                          {hasError && (
                            <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </checkoutForm.Field>

                  <checkoutForm.Field
                    name="pincode"
                    validators={{
                      onChange: ({ value }) => {
                        const res = z
                          .string()
                          .trim()
                          .regex(/^\d{6}$/, "6-digit Pincode required")
                          .safeParse(value);
                        return !res.success ? res.error.issues[0]?.message : undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const hasError =
                        field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                      return (
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                            PINCODE *
                          </label>
                          <input
                            maxLength={6}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="400001"
                            className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 font-mono ${
                              hasError
                                ? "border-red-600 bg-red-50/20"
                                : "border-neutral-300 focus:border-black"
                            }`}
                          />
                          {hasError && (
                            <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </checkoutForm.Field>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>CONTINUE TO PAYMENT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setStep("cart")}
                className="w-full text-center text-[11px] text-neutral-500 hover:text-black uppercase tracking-wider"
              >
                Return to Bag Review
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SIMULATED PAYMENT (TanStack Form + Zod) */}
        {/* ========================================================================= */}
        {step === "payment" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              checkoutForm.handleSubmit();
            }}
            className="flex-1 overflow-y-auto flex flex-col justify-between"
          >
            <div className="p-6 space-y-5">
              {/* Order total & Shipping Destination recap */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-600 uppercase tracking-wider">
                  <span>FINAL PAYABLE AMOUNT</span>
                  <span className="font-semibold text-black text-sm font-mono">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-neutral-500 pt-1 border-t border-neutral-200">
                  <MapPin className="w-3 h-3 text-black shrink-0" />
                  <span className="truncate">
                    Ship to: {checkoutForm.state.values.fullName} (
                    {checkoutForm.state.values.pincode})
                  </span>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest border-b border-neutral-100 pb-3">
                <span className="text-neutral-500 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>SHIPPING CONFIRMED</span>
                </span>
                <span>→</span>
                <span className="font-semibold text-black flex items-center space-x-1">
                  <span className="w-4 h-4 bg-black text-white flex items-center justify-center text-[9px] font-mono">
                    2
                  </span>
                  <span>CARD PAYMENT</span>
                </span>
              </div>

              {/* Payment Card Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
                    ENTER CARD DETAILS
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[9px] uppercase tracking-widest text-black underline font-mono hover:text-neutral-600"
                  >
                    FILL TEST CARD
                  </button>
                </div>

                {/* Card Number */}
                <checkoutForm.Field
                  name="cardNumber"
                  validators={{
                    onChange: ({ value }) => {
                      const raw = value.replace(/\s+/g, "");
                      if (raw.length !== 16 || !/^\d+$/.test(raw)) {
                        return "16-digit card number required";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                          CARD NUMBER *
                        </label>
                        <div className="relative">
                          <input
                            maxLength={19}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              // Auto group into 4-digit blocks
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
                              field.handleChange(formatted);
                            }}
                            placeholder="4532 8219 9201 1029"
                            className={`w-full bg-white border p-2.5 pr-9 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 font-mono ${
                              hasError
                                ? "border-red-600 bg-red-50/20"
                                : "border-neutral-300 focus:border-black"
                            }`}
                          />
                          <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {hasError && (
                          <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </checkoutForm.Field>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <checkoutForm.Field
                    name="expiry"
                    validators={{
                      onChange: ({ value }) => {
                        const res = z
                          .string()
                          .trim()
                          .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY format required")
                          .safeParse(value);
                        return !res.success ? res.error.issues[0]?.message : undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const hasError =
                        field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                      return (
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                            EXPIRY (MM/YY) *
                          </label>
                          <input
                            maxLength={5}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 3) {
                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                              }
                              field.handleChange(val);
                            }}
                            placeholder="12/28"
                            className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 font-mono ${
                              hasError
                                ? "border-red-600 bg-red-50/20"
                                : "border-neutral-300 focus:border-black"
                            }`}
                          />
                          {hasError && (
                            <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </checkoutForm.Field>

                  <checkoutForm.Field
                    name="cvv"
                    validators={{
                      onChange: ({ value }) => {
                        const res = z
                          .string()
                          .trim()
                          .regex(/^\d{3}$/, "3-digit CVV")
                          .safeParse(value);
                        return !res.success ? res.error.issues[0]?.message : undefined;
                      },
                    }}
                  >
                    {(field) => {
                      const hasError =
                        field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                      return (
                        <div className="space-y-1">
                          <label className="block text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
                            CVV / CVC *
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 3))
                            }
                            placeholder="882"
                            className={`w-full bg-white border p-2.5 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 font-mono ${
                              hasError
                                ? "border-red-600 bg-red-50/20"
                                : "border-neutral-300 focus:border-black"
                            }`}
                          />
                          {hasError && (
                            <p className="text-[10px] text-red-600 font-mono tracking-wider mt-0.5">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </checkoutForm.Field>
                </div>

                {/* Security Reassurance */}
                <div className="p-3 border border-neutral-200 bg-neutral-50 flex items-center space-x-2 text-[10px] uppercase tracking-wider text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span>256-BIT SSL ENCRYPTION • SECURE SIMULATED PAYMENT</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>
                  {isProcessing
                    ? "AUTHORIZING PAYMENT..."
                    : `CONFIRM & PAY ${formatINR(subtotal)}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setStep("shipping")}
                className="w-full text-center text-[11px] text-neutral-500 hover:text-black uppercase tracking-wider"
              >
                Back to Shipping Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
