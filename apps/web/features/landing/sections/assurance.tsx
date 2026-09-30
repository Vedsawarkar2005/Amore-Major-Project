import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/primitives/card";
import { ShieldCheckIcon, TruckIcon, Undo2Icon } from "@/components/icons";
import Link from "next/link";

import { CountUp } from "@/components/motion/count-up";
import { RollText } from "@/components/motion/roll-text";
import { SplitRow } from "@/components/page/split-row";

// Summaries of the published shipping and refund policies. `days` is the
// number each promise turns on, shown large.
const promises = [
  {
    icon: TruckIcon,
    days: 7,
    title: "Dispatched within 7 days",
    body: "Orders are handed to the courier within 0–7 days of order and payment.",
    href: "/shipping",
    link: "Shipping policy",
  },
  {
    icon: ShieldCheckIcon,
    days: 15,
    title: "15 days to raise a problem",
    body: "Damaged, defective or not as shown? Tell us within 15 days of delivery.",
    href: "/refunds",
    link: "Cancellation & refunds",
  },
  {
    icon: Undo2Icon,
    days: 15,
    title: "Refunds within 15 days",
    body: "Approved refunds are processed to you within 15 days.",
    href: "/refunds",
    link: "How refunds work",
  },
] as const;

export function Assurance() {
  return (
    <section
      aria-labelledby="assurance-title"
      className="bg-porcelain dark:bg-muted"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-28">
        <SplitRow id="assurance-title" title="Order with confidence">
          Straightforward terms, written down.{" "}
          <Link className="underline underline-offset-4" href="/contact">
            Contact us
          </Link>{" "}
          with any question before you order.
        </SplitRow>
        <ul className="grid gap-6 md:grid-cols-3">
          {promises.map((promise) => (
            <li key={promise.title}>
              <Card className="h-full gap-3 rounded-2xl bg-background px-8 shadow-none">
                <div className="mb-6 flex items-start justify-between gap-4">
                  {/* The number the promise turns on, counted up on arrival;
                    the title below says it in words. */}
                  <p aria-hidden="true" className="flex items-baseline gap-2">
                    <CountUp
                      className="font-heading text-8xl text-shade-ink tabular-nums leading-[0.8]"
                      value={promise.days}
                    />
                    <span className="font-heading text-2xl text-muted-foreground italic">
                      days
                    </span>
                  </p>
                  <promise.icon
                    aria-hidden="true"
                    className="size-6 text-rose-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <CardTitle className="font-normal text-2xl normal-case tracking-tight">
                  <h3>{promise.title}</h3>
                </CardTitle>
                <CardDescription className="text-base">
                  {promise.body}
                </CardDescription>
                <Link
                  className="mt-auto w-fit border-current border-b pt-4 text-sm hover:text-rose-gold"
                  data-roll
                  href={promise.href}
                >
                  <RollText>{promise.link}</RollText>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
