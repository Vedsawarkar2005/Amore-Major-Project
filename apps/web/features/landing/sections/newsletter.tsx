import { Card } from "@/components/primitives/card";

import { SwatchReveal } from "@/components/motion/swatch-reveal";
import { ShadeBullet } from "@/components/product/shade-bullet";
import { shades } from "@/content/hydravelvet";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";

import { type Floater, FloatField } from "../float/float-field";

// A few bullets hanging in the card's glowing corner, above the form.
const floaters: Floater[] = [
  {
    kind: "bullet",
    left: "84%",
    top: "10%",
    width: "clamp(1.25rem,2vw,2rem)",
    depth: 1.1,
    tilt: 22,
  },
  {
    kind: "bullet",
    left: "92%",
    top: "30%",
    width: "clamp(0.9rem,1.3vw,1.3rem)",
    depth: 0.6,
    tilt: -16,
    shade: 9,
  },
  {
    kind: "bullet",
    left: "72%",
    top: "6%",
    width: "clamp(0.7rem,1vw,1rem)",
    depth: 0.45,
    tilt: 8,
    shade: 6,
    wideOnly: true,
  },
];

/**
 * Newsletter sign-up, just before the closing call to action. Promises only
 * what the brand has actually planned: new shades, restocks, and the try-on
 * and shade-finder launches.
 */
export function Newsletter() {
  return (
    <section
      aria-labelledby="newsletter-title"
      className="mx-auto max-w-7xl px-4 py-28"
    >
      <Card className="relative gap-0 overflow-hidden rounded-2xl px-6 py-14 shadow-none sm:px-12 md:py-20">
        {/* A soft rose-gold glow in the corner, echoing the hero's spotlight. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgb(214_149_123/0.2),transparent_70%)]"
        />
        <FloatField pieces={floaters} />

        <div className="relative grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16">
          <div>
            <SwatchReveal>
              <h2 className="text-shade-ink text-title" id="newsletter-title">
                First to know, first to wear.
              </h2>
            </SwatchReveal>
            <p className="mt-5 max-w-md text-lead text-muted-foreground">
              New shades, restocks and the launch of our virtual try-on and
              shade finder, straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Every shade as a bullet in a row, like a tester tray: a quiet
            reminder of the range. */}
        <ul
          aria-hidden="true"
          className="relative mt-12 flex flex-wrap items-end gap-2"
        >
          {shades.map((shade) => (
            <li key={shade.slug}>
              <ShadeBullet className="h-7 w-3" color={shade.color} />
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
