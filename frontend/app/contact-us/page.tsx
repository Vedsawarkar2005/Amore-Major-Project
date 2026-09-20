"use client";

import React from "react";
import { Mail, Phone, ArrowRight, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "@/components/ui/sonner";

// Strict Zod Schema for Client Care Form
const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[0-9+-\s()]{7,15}$/.test(val), {
      message: "Please enter a valid phone number (or leave blank)",
    }),
  orderId: z.string().trim().optional(),
  subject: z.string().optional(),
  message: z.string().trim().min(15, "Message must be at least 15 characters"),
});

export default function ContactPage() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      orderId: "",
      subject: "General Inquiry",
      message: "",
    },
    onSubmit: async ({ value }) => {
      const result = contactSchema.safeParse(value);
      if (!result.success) {
        toast.error("Form Validation Error", {
          description: result.error.issues[0]?.message || "Please correct errors before submitting.",
        });
        return;
      }

      // Simulate API transmission
      await new Promise((resolve) => setTimeout(resolve, 700));

      toast.success("Message Sent Successfully", {
        description: `Thank you ${value.name}, our beauty advisors will reply to ${value.email} within 24 hours.`,
      });

      form.reset();
    },
  });

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Editorial Header */}
      <div className="border-b border-neutral-200 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
            CLIENT CONCIERGE
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-light uppercase tracking-tight">
            CONTACT AMORE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light tracking-wide leading-relaxed">
            Have questions regarding shades, orders, or formulation? Our beauty advisors are at your
            service.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Inquiries Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-serif font-medium uppercase tracking-tight">
                GET IN TOUCH
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
                We take immense pride in delivering prompt, caring service to every client. Reach
                out via email, phone, or direct message.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-neutral-200 text-xs">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-black">EMAIL INQUIRIES</p>
                  <a
                    href="mailto:info@amorecosmetics.in"
                    className="text-neutral-600 hover:text-black hover:underline tracking-wide mt-0.5 block"
                  >
                    info@amorecosmetics.in
                  </a>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Response within 24 business hours</p>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-black">
                    TELEPHONE & WHATSAPP
                  </p>
                  <a
                    href="tel:+919558907807"
                    className="text-neutral-600 hover:text-black hover:underline tracking-wide mt-0.5 block"
                  >
                    +91 9558907807
                  </a>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Direct client support line</p>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                  <InstagramIcon className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-black">SOCIAL COMMUNITY</p>
                  <a
                    href="https://instagram.com/amore_.cosmetic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-black hover:underline tracking-wide mt-0.5 block"
                  >
                    @amore_.cosmetic
                  </a>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Tag us in your velvet look</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-black">CONCIERGE HOURS</p>
                  <p className="text-neutral-600 tracking-wide mt-0.5">
                    Monday to Saturday: 10:00 AM – 6:00 PM IST
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Closed on Sunday & National Holidays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: TanStack Form with Zod Validation */}
          <div className="lg:col-span-7 bg-neutral-50 border border-neutral-200 p-8 sm:p-12">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-black">
                CLIENT CARE INQUIRY
              </h3>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono border border-neutral-300 px-2 py-0.5">
                SECURE FORM
              </span>
            </div>
            <p className="text-xs text-neutral-500 mb-8 tracking-wide font-light">
              Submit your message below. All fields marked with * are strictly validated.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Name */}
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const res = z
                        .string()
                        .trim()
                        .min(2, "Name must be at least 2 characters")
                        .safeParse(value);
                      return !res.success ? res.error.issues[0]?.message : undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                          FULL NAME *
                        </label>
                        <input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="YOUR FULL NAME"
                          className={`w-full bg-white border p-3 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 transition-colors ${
                            hasError
                              ? "border-red-600 focus:border-red-600 bg-red-50/10"
                              : "border-neutral-300 focus:border-black"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[10px] text-red-600 uppercase tracking-wider font-mono mt-1">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>

                {/* Field: Email */}
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      const res = z
                        .string()
                        .trim()
                        .email("Please enter a valid email address")
                        .safeParse(value);
                      return !res.success ? res.error.issues[0]?.message : undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                          EMAIL ADDRESS *
                        </label>
                        <input
                          type="email"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="YOUR EMAIL ADDRESS"
                          suppressHydrationWarning
                          className={`w-full bg-white border p-3 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 transition-colors ${
                            hasError
                              ? "border-red-600 focus:border-red-600 bg-red-50/10"
                              : "border-neutral-300 focus:border-black"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[10px] text-red-600 uppercase tracking-wider font-mono mt-1">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Phone (Optional) */}
                <form.Field
                  name="phone"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim() === "") return undefined;
                      const res = z
                        .string()
                        .regex(
                          /^[0-9+-\s()]{7,15}$/,
                          "Please enter a valid phone number (or leave blank)"
                        )
                        .safeParse(value);
                      return !res.success ? res.error.issues[0]?.message : undefined;
                    },
                  }}
                >
                  {(field) => {
                    const hasError =
                      field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                    return (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                          PHONE NUMBER (OPTIONAL)
                        </label>
                        <input
                          type="tel"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="+91 98765 43210"
                          className={`w-full bg-white border p-3 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 transition-colors ${
                            hasError
                              ? "border-red-600 focus:border-red-600 bg-red-50/10"
                              : "border-neutral-300 focus:border-black"
                          }`}
                        />
                        {hasError && (
                          <p className="text-[10px] text-red-600 uppercase tracking-wider font-mono mt-1">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.Field>

                {/* Field: Subject */}
                <form.Field name="subject">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                        INQUIRY SUBJECT
                      </label>
                      <select
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-3 text-xs uppercase tracking-wider text-black focus:outline-none focus:border-black cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Tracking & Delivery">Order Tracking & Delivery</option>
                        <option value="Shade Recommendation">Shade Recommendation</option>
                        <option value="Return or Replacement">Return or Replacement</option>
                        <option value="B2B & Wholesale">B2B & Wholesale</option>
                      </select>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Field: Message (Minimum 15 characters) */}
              <form.Field
                name="message"
                validators={{
                  onChange: ({ value }) => {
                    const res = z
                      .string()
                      .trim()
                      .min(15, "Message must be at least 15 characters")
                      .safeParse(value);
                    return !res.success ? res.error.issues[0]?.message : undefined;
                  },
                }}
              >
                {(field) => {
                  const hasError =
                    field.state.meta.errors.length > 0 && field.state.meta.isTouched;
                  const charCount = field.state.value.trim().length;
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                          YOUR MESSAGE *
                        </label>
                        <span
                          className={`text-[10px] font-mono tracking-wider ${
                            charCount >= 15 ? "text-neutral-500" : "text-neutral-400"
                          }`}
                        >
                          {charCount} / 15 MIN CHARACTERS
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="HOW CAN WE ASSIST YOU TODAY? PLEASE PROVIDE DETAILED INFORMATION (MINIMUM 15 CHARACTERS)..."
                        className={`w-full bg-white border p-3 text-xs uppercase tracking-wider text-black focus:outline-none placeholder:text-neutral-400 transition-colors ${
                          hasError
                            ? "border-red-600 focus:border-red-600 bg-red-50/10"
                            : "border-neutral-300 focus:border-black"
                        }`}
                      />
                      {hasError && (
                        <p className="text-[10px] text-red-600 uppercase tracking-wider font-mono mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  );
                }}
              </form.Field>

              {/* Submit Button */}
              <form.Subscribe selector={(state) => [state.isSubmitting]}>
                {([isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-black text-white text-xs font-medium uppercase tracking-[0.25em] hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <span>{isSubmitting ? "TRANSMITTING..." : "SUBMIT INQUIRY"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </form.Subscribe>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
