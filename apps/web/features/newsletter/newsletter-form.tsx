"use client";

import { Button } from "@/components/primitives/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/primitives/field";
import { Input } from "@/components/primitives/input";
import { useActionState, useId } from "react";

import { type SubscribeState, subscribe } from "./actions";

const initialState: SubscribeState = { status: "idle" };

/**
 * Email field + button that submit to the `subscribe` server action. It works
 * before JavaScript loads too (a plain form post). After a sign-up it's
 * replaced by the confirmation; errors appear under the field and keep what
 * was typed. Built from shadcn's Field, Input and Button.
 */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initialState);
  const id = useId();
  const emailId = `${id}-email`;
  const messageId = `${id}-message`;

  if (state.status === "success") {
    return (
      <p className="text-lead" role="status">
        {state.message}
      </p>
    );
  }

  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction}>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel className="sr-only" htmlFor={emailId}>
          Email address
        </FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            aria-describedby={messageId}
            aria-invalid={error ? true : undefined}
            autoComplete="email"
            className="h-12 rounded-full border-input bg-background px-5 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive sm:flex-1"
            defaultValue={error?.email}
            id={emailId}
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
            suppressHydrationWarning
          />
          <Button
            className="h-12 rounded-full px-7 text-sm normal-case tracking-normal"
            disabled={pending}
            type="submit"
          >
            {pending ? "Subscribing…" : "Subscribe"}
          </Button>
        </div>

        {/* Honeypot for bots (see the action). Hidden from people and from
            assistive technology, and skipped by the keyboard. */}
        <div aria-hidden="true" className="hidden">
          <input
            autoComplete="off"
            name="website"
            tabIndex={-1}
            type="text"
            suppressHydrationWarning
          />
        </div>

        {error ? (
          <FieldError aria-live="polite" id={messageId}>
            {error.message}
          </FieldError>
        ) : (
          <FieldDescription aria-live="polite" id={messageId}>
            No spam, just new shades and launches.
          </FieldDescription>
        )}
      </Field>
    </form>
  );
}
