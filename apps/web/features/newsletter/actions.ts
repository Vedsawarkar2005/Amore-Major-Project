"use server";

import { siteConfig } from "@/config/site";

import { addSubscriber } from "./provider";

/** What the form shows after each attempt. */
export type SubscribeState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; email: string };

// Deliberately loose: something@something.tld. The confirmation email (from
// the email service) is the real check that an address works.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

const SUCCESS_MESSAGE =
  "You're on the list. We'll write when there's something worth opening.";

/**
 * Newsletter sign-up, called by the form with its FormData. Validates on the
 * server (the browser's own `type="email"` check can be bypassed), filters
 * bots with a honeypot field, then hands the address to the provider.
 */
export async function subscribe(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Honeypot: a field people never see. Bots fill every field, so a value
  // here means a bot; show success so it learns nothing, and store nothing.
  if (formData.get("website")) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
      email,
    };
  }

  const result = await addSubscriber(email);
  if (result.ok) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  return {
    status: "error",
    message:
      result.reason === "not-configured"
        ? `Sign-ups open soon. Until then, write to us at ${siteConfig.contact.email}.`
        : "Something went wrong on our side. Please try again in a moment.",
    email,
  };
}
