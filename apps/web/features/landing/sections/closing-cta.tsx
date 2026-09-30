import { Particles } from "@/components/primitives/particles";

import { FocusText } from "@/components/motion/focus-text";
import { CtaLink } from "@/components/page/cta-link";
import { hydravelvet, shades } from "@/content/hydravelvet";
import { formatInr } from "@/lib/format";

import { type Floater, FloatField } from "../float/float-field";

// The ingredients and the picked shade, drifting up the right-hand side,
// away from the copy on the left.
const floaters: Floater[] = [
  {
    kind: "bullet",
    left: "78%",
    top: "18%",
    width: "clamp(1.75rem,3vw,3rem)",
    depth: 1.2,
    tilt: 26,
  },
  {
    kind: "blueberry",
    left: "88%",
    top: "58%",
    width: "clamp(4rem,8vw,8rem)",
    depth: 1.5,
    tilt: -14,
  },
  {
    kind: "avocado",
    left: "66%",
    top: "64%",
    width: "clamp(2.5rem,4.5vw,4.5rem)",
    depth: 0.7,
    tilt: 30,
    wideOnly: true,
  },
  {
    kind: "drop",
    left: "92%",
    top: "8%",
    width: "clamp(1.25rem,2vw,2rem)",
    depth: 0.5,
    tilt: -6,
  },
  {
    kind: "bullet",
    left: "60%",
    top: "12%",
    width: "clamp(0.75rem,1.1vw,1.1rem)",
    depth: 0.45,
    tilt: -18,
    shade: 3,
    wideOnly: true,
  },
];

export function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-title"
      className="dark relative overflow-hidden bg-noir text-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_20%_100%,rgb(214_149_123/0.22),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="stage-grain pointer-events-none absolute inset-0"
      />
      {/* Rose-gold dust rising slowly, leaning toward the cursor. */}
      <Particles
        className="absolute inset-0"
        color="#f3d4c4"
        ease={70}
        quantity={60}
        staticity={40}
        vy={-0.06}
      />
      <FloatField parallax pieces={floaters} />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 py-32">
        <FocusText>
          <h2 className="max-w-4xl text-display" id="closing-title">
            Beauty that is felt, not just seen.
          </h2>
        </FocusText>
        <p className="max-w-md text-lead text-muted-foreground">
          {shades.length} velvet shades, each {formatInr(hydravelvet.priceInr)},
          made with Blueberry Butter, Avocado Oil and Vitamin E.
        </p>
        <div className="flex flex-wrap gap-3">
          <CtaLink href="/hydravelvet">Shop Hydravelvet</CtaLink>
          <CtaLink href="/contact" variant="outline">
            Ask us anything
          </CtaLink>
        </div>
      </div>

      <ul aria-hidden="true" className="relative flex h-3">
        {shades.map((shade) => (
          <li
            className="flex-1"
            key={shade.slug}
            style={{ backgroundColor: shade.color }}
          />
        ))}
      </ul>
    </section>
  );
}
