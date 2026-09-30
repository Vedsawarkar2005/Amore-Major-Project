import { Particles } from "@/components/primitives/particles";

import { DrawUnderline } from "@/components/motion/draw-underline";
import { ScrubWords } from "@/components/motion/scrub-words";
import { CtaLink } from "@/components/page/cta-link";
import { getFoundersNote } from "@/content/site-copy";

import { type Floater, FloatField } from "../float/float-field";

// Bullets in a spread of shades drifting around the quote, kept to the
// margins so the words stay clear.
const floaters: Floater[] = [
  {
    kind: "bullet",
    left: "86%",
    top: "10%",
    width: "clamp(1.5rem,2.4vw,2.5rem)",
    depth: 1.3,
    tilt: 24,
    shade: 0,
  },
  {
    kind: "bullet",
    left: "93%",
    top: "56%",
    width: "clamp(2rem,3.4vw,3.5rem)",
    depth: 1.55,
    tilt: -34,
    shade: 11,
    wideOnly: true,
  },
  {
    kind: "bullet",
    left: "74%",
    top: "80%",
    width: "clamp(0.75rem,1.2vw,1.2rem)",
    depth: 0.5,
    tilt: 12,
    shade: 5,
  },
  {
    kind: "bullet",
    left: "3%",
    top: "84%",
    width: "clamp(1rem,1.6vw,1.6rem)",
    depth: 0.8,
    tilt: -20,
    shade: 8,
  },
  {
    kind: "drop",
    left: "62%",
    top: "5%",
    width: "clamp(1.25rem,2vw,2rem)",
    depth: 0.45,
    tilt: 6,
    wideOnly: true,
  },
];

/** The words in the quote that get a lipstick stroke underneath. */
const UNDERLINED = "care and colour";

export async function Founders() {
  const foundersNote = await getFoundersNote();
  const [before, after] = foundersNote.quote.split(UNDERLINED);

  return (
    <section
      aria-labelledby="founders-title"
      className="dark relative overflow-hidden bg-noir text-foreground"
    >
      {/* Rose-gold dust rising slowly, leaning toward the cursor. */}
      <Particles
        className="absolute inset-0"
        color="#f3d4c4"
        ease={70}
        quantity={70}
        staticity={40}
        vy={-0.06}
      />
      <FloatField parallax pieces={floaters} />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-32">
        <p className="text-rose-gold">{foundersNote.title}</p>
        <blockquote>
          <ScrubWords>
            <p
              className="max-w-5xl text-balance text-display"
              id="founders-title"
            >
              “{before}
              {after === undefined ? null : (
                <>
                  <span className="relative inline-block whitespace-nowrap">
                    {UNDERLINED}
                    <DrawUnderline className="text-shade-ink" />
                  </span>
                  {after}
                </>
              )}
              ”
            </p>
          </ScrubWords>
        </blockquote>
        <div>
          <CtaLink
            className="bg-rose-gold text-lacquer hover:bg-rose-gold-light"
            href="/about"
          >
            Read the founders' note
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
