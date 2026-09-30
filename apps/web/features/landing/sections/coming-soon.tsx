import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentType } from "react";

import { RollText } from "@/components/motion/roll-text";
import { SplitRow } from "@/components/page/split-row";
import { ShadeBullet } from "@/components/product/shade-bullet";
import { getShade } from "@/content/hydravelvet";

import { Lips } from "../ritual/lips";

/**
 * A viewfinder on lips wearing the picked shade: what the try-on will show.
 * On hover a scan line sweeps the frame.
 */
function TryOnPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-5/3 overflow-hidden rounded-xl bg-[radial-gradient(75%_90%_at_50%_58%,#dca783,#a26c4b_62%,#2a1a14)]"
    >
      <Lips className="absolute top-1/2 left-1/2 w-[56%] -translate-x-1/2 -translate-y-1/2 text-ink transition-transform duration-700 group-hover:scale-105" />
      {/* Corner brackets of the viewfinder. */}
      {[
        "top-4 left-4 border-t border-l",
        "top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l",
        "right-4 bottom-4 border-r border-b",
      ].map((corner) => (
        <span
          className={cn("absolute size-6 border-rose-gold-light/90", corner)}
          key={corner}
        />
      ))}
      <span className="absolute inset-x-8 top-0 h-px bg-rose-gold-light opacity-0 transition-opacity group-hover:opacity-80 motion-safe:group-hover:animate-[scan_2.6s_ease-in-out_infinite]" />
    </div>
  );
}

// Undertones the finder will ask about, and shades it might suggest for a
// warm one (an illustration, not a recommendation).
const undertones = [
  { name: "Warm", color: "#d8a068" },
  { name: "Neutral", color: "#c7a28a" },
  { name: "Cool", color: "#c49ba8" },
];
const suggested = ["caramel-mocha", "soft-peach", "brick-brown"].flatMap(
  (slug) => getShade(slug) ?? [],
);

/**
 * Undertone choices leading to a few suggested bullets: what the shade
 * finder will do. On hover the first choice is picked and the suggestions
 * twist up.
 */
function FinderPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-5/3 items-center justify-center gap-3 overflow-hidden rounded-xl bg-muted px-4 sm:gap-10 sm:px-6"
    >
      <ul className="flex flex-col gap-2 text-sm">
        {undertones.map((tone, index) => (
          <li
            className={cn(
              "flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pr-4 pl-1.5 transition-colors duration-500",
              index === 0 &&
                "group-hover:border-foreground group-hover:bg-foreground group-hover:text-background",
            )}
            key={tone.name}
          >
            <span
              className="size-5 rounded-full"
              style={{ backgroundColor: tone.color }}
            />
            {tone.name}
          </li>
        ))}
      </ul>
      <span className="h-px w-4 shrink-0 bg-foreground/30 sm:w-14" />
      <div className="flex h-20 items-end gap-2.5">
        {suggested.map((shade, index) => (
          <ShadeBullet
            className="h-full w-6 origin-bottom scale-y-[0.55] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
            color={shade.color}
            key={shade.slug}
            style={{ transitionDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

const features: {
  href: "/try-on" | "/shade-finder";
  title: string;
  body: string;
  preview: ComponentType;
}[] = [
  {
    href: "/try-on",
    title: "Virtual try-on",
    body: "See any shade on your own lips, live through your camera, before you buy.",
    preview: TryOnPreview,
  },
  {
    href: "/shade-finder",
    title: "Shade finder",
    body: "Answer a few questions about your skin tone and preferences and get the shades that suit you.",
    preview: FinderPreview,
  },
];

export function ComingSoon() {
  return (
    <section
      aria-labelledby="coming-soon-title"
      className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-28"
    >
      <SplitRow
        id="coming-soon-title"
        title="Find your shade before you buy it"
      >
        Two tools we're building to take the guesswork out of choosing a
        lipstick online.
      </SplitRow>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <li className="min-w-0" key={feature.href}>
            <Link
              className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-roll
              href={feature.href}
            >
              <Card className="h-full rounded-2xl shadow-none transition-colors [--card-spacing:--spacing(6)] group-hover:bg-muted/60 sm:[--card-spacing:--spacing(10)]">
                <CardContent>
                  <feature.preview />
                </CardContent>
                <CardHeader className="gap-3">
                  <Badge variant="secondary">Coming soon</Badge>
                  <CardTitle className="font-normal text-[clamp(2rem,3vw+1rem,3.5rem)] normal-case leading-none tracking-normal">
                    <RollText className="-my-[0.1em] leading-[1.2]">
                      {feature.title}
                    </RollText>
                  </CardTitle>
                  <CardDescription className="max-w-sm text-base">
                    {feature.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
