/*
 * Where newsletter sign-ups are delivered. This is the only file that knows
 * about the email service, so switching services only changes this file.
 *
 * Today it POSTs each sign-up as JSON to NEWSLETTER_WEBHOOK_URL:
 *   { "email": "…", "source": "amorecosmetics.in", "subscribedAt": "…" }
 * That works with Zapier, Make or a Google Apps Script (e.g. into a sheet),
 * or point it at your own endpoint. To use an email service's API directly
 * (Klaviyo, Mailchimp, Resend, …), replace the body of `addSubscriber`.
 *
 * Imported only by the server action, so the URL never reaches the browser.
 */

import { env } from "@/lib/env";

export type AddSubscriberResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "failed" };

export async function addSubscriber(
  email: string,
): Promise<AddSubscriberResult> {
  const url = env.NEWSLETTER_WEBHOOK_URL;

  if (!url) {
    // Let the form be tried locally without a service; never in production,
    // where silently dropping sign-ups would lose real subscribers.
    if (process.env.NODE_ENV === "development") {
      console.info(`[newsletter] NEWSLETTER_WEBHOOK_URL unset; got ${email}`);
      return { ok: true };
    }
    return { ok: false, reason: "not-configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source: "amorecosmetics.in",
        subscribedAt: new Date().toISOString(),
      }),
      // Don't keep the visitor waiting on a slow service.
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "failed" };
  } catch (error) {
    console.error("[newsletter] delivery failed", error);
    return { ok: false, reason: "failed" };
  }
}
