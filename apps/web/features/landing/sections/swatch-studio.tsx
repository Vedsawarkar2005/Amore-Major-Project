"use client";

import { AspectRatio } from "@/components/primitives/aspect-ratio";
import { Button } from "@/components/primitives/button";
import {
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/primitives/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import { cn } from "@/lib/utils";
import { type PointerEvent, useId, useRef, useState } from "react";

import { RollText } from "@/components/motion/roll-text";
import { SplitRow } from "@/components/page/split-row";
import { type Shade, shades } from "@/content/hydravelvet";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

import { pickShade } from "../shade/shade-pick";
import { getSelectedShade, useSelectedShade } from "../shade/shade-store";

/** Skin, lit from the top left: a lighter and a deeper tone for each. */
const tones = [
  { name: "Fair", light: "#f7dcc6", deep: "#e2b495" },
  { name: "Medium", light: "#e4b792", deep: "#c68d66" },
  { name: "Tan", light: "#c99169", deep: "#9d6742" },
  { name: "Deep", light: "#93603f", deep: "#5e3924" },
] as const;

type Point = [x: number, y: number];
type Stroke = { shade: Shade; points: Point[] };

/** Most swatches kept on the card; the oldest go first. */
const MAX_STROKES = 16;

/**
 * A swatch as it's drawn across an arm: one sweep, slightly arched. Each
 * new one sits lower on the card. Points are fractions of the card.
 */
function sweep(row: number): Point[] {
  const y = 0.26 + (row % 4) * 0.16;
  return Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    return [0.16 + t * 0.68, y - Math.sin(t * Math.PI) * 0.05 + t * 0.03];
  });
}

/** Traces a stroke through the midpoints of its points, for smooth curves. */
function trace(
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
) {
  context.beginPath();
  const [first] = points;
  if (!first) return;
  context.moveTo(first[0] * width, first[1] * height);
  for (let index = 1; index < points.length - 1; index++) {
    const [x, y] = points[index] as Point;
    const [nx, ny] = points[index + 1] as Point;
    context.quadraticCurveTo(
      x * width,
      y * height,
      ((x + nx) / 2) * width,
      ((y + ny) / 2) * height,
    );
  }
  const last = points.at(-1) as Point;
  context.lineTo(last[0] * width, last[1] * height);
}

/**
 * Try a shade on a skin tone: pick both, then draw across the card with a
 * finger or the mouse (or add a swatch with the button). The colour is
 * multiplied into the skin, the way pigment sits on it, so the same shade
 * reads deeper on deeper skin. Shades picked here are picked everywhere
 * (the stage, the headings). A close guide, not a colour-accurate one.
 */
export function SwatchStudio() {
  const toneName = useId();
  const card = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef<Stroke | null>(null);
  const toneIndex = useRef(1);
  const shade = useSelectedShade();
  const [tone, setTone] = useState(1);
  const [swatched, setSwatched] = useState<string[]>([]);

  const paint = () => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!(element && context)) return;
    const { width, height } = element.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (element.width !== Math.round(width * dpr)) {
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;

    // Skin, lit from the top left, rounding away into shadow at the foot,
    // like the inside of a forearm.
    const skin = tones[toneIndex.current] ?? tones[1];
    const light = context.createLinearGradient(0, 0, width, height);
    light.addColorStop(0, skin.light);
    light.addColorStop(1, skin.deep);
    context.fillStyle = light;
    context.fillRect(0, 0, width, height);
    const round = context.createLinearGradient(0, 0, 0, height);
    round.addColorStop(0, "rgb(255 255 255 / 0.1)");
    round.addColorStop(0.45, "rgb(255 255 255 / 0)");
    round.addColorStop(1, "rgb(0 0 0 / 0.14)");
    context.fillStyle = round;
    context.fillRect(0, 0, width, height);

    const size = Math.min(width, height) * 0.085;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const stroke of strokes.current) {
      if (stroke.points.length < 2) continue;
      // Pigment, multiplied into the skin, its edges just soft…
      context.globalCompositeOperation = "multiply";
      context.strokeStyle = stroke.shade.color;
      context.globalAlpha = 0.9;
      context.lineWidth = size;
      context.filter = `blur(${(size * 0.03).toFixed(1)}px)`;
      trace(context, stroke.points, width, height);
      context.stroke();
      // …with the faint, even sheen of a velvet finish.
      context.filter = `blur(${(size * 0.12).toFixed(1)}px)`;
      context.globalCompositeOperation = "screen";
      context.strokeStyle = "#ffffff";
      context.globalAlpha = 0.07;
      context.lineWidth = size * 0.5;
      context.stroke();
      context.filter = "none";
    }
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
  };

  // Pointer events can arrive several times a frame (high-refresh screens,
  // pens); every repaint re-blurs every stroke, so draw at most once a frame.
  const frame = useRef(0);
  const requestPaint = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      paint();
    });
  };

  const remember = () =>
    setSwatched([
      ...new Set(strokes.current.map((stroke) => stroke.shade.name)),
    ]);

  const keep = (stroke: Stroke) => {
    strokes.current = [...strokes.current, stroke].slice(-MAX_STROKES);
  };

  /** Draws one sweep across the card; set up with the card's animations. */
  const addSwatch = useRef(() => {});

  useGSAP(
    (_context, contextSafe) => {
      const element = card.current;
      if (!(element && contextSafe)) return;
      const resize = new ResizeObserver(() => paint());
      resize.observe(element);

      // Context-safe, so a sweep still drawing is stopped on unmount.
      addSwatch.current = contextSafe(() => {
        const path = sweep(strokes.current.length);
        const stroke: Stroke = {
          shade: getSelectedShade(),
          points: path.slice(0, 2),
        };
        keep(stroke);
        const progress = { count: 2 };
        gsap.to(progress, {
          count: path.length,
          duration: prefersReducedMotion() ? 0 : 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            stroke.points = path.slice(0, Math.round(progress.count));
            paint();
          },
          onComplete: remember,
        });
      });

      // The first time the card comes into view, a swatch draws itself, as
      // an invitation to draw another.
      ScrollTrigger.create({
        trigger: element,
        start: "top 70%",
        once: true,
        onEnter: () => addSwatch.current(),
      });

      return () => {
        resize.disconnect();
        cancelAnimationFrame(frame.current);
      };
    },
    { scope: card },
  );

  const clear = () => {
    strokes.current = [];
    paint();
    remember();
  };

  const pointAt = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return [
      (event.clientX - box.left) / box.width,
      (event.clientY - box.top) / box.height,
    ];
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = { shade: getSelectedShade(), points: [pointAt(event)] };
    keep(drawing.current);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    const stroke = drawing.current;
    if (!stroke) return;
    const point = pointAt(event);
    const last = stroke.points.at(-1) as Point;
    if (Math.hypot(point[0] - last[0], point[1] - last[1]) < 0.004) return;
    stroke.points.push(point);
    requestPaint();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = null;
    remember();
  };

  const toneLabel = tones[tone]?.name ?? "";
  const description = swatched.length
    ? `Swatches of ${swatched.join(", ")} on ${toneLabel.toLowerCase()} skin.`
    : `Bare ${toneLabel.toLowerCase()} skin, ready for a swatch.`;

  return (
    <section
      aria-labelledby="swatch-title"
      className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-28"
    >
      <SplitRow id="swatch-title" title="Swatch it on your skin tone">
        Pick a skin tone and a shade, then draw across the card. The colour sits
        on the skin the way pigment does, so deeper tones deepen it. Screens
        vary, so treat it as a close guide.
      </SplitRow>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start md:gap-8">
        <div className="flex flex-col gap-10 md:col-span-5">
          <FieldSet>
            <FieldLegend className="font-heading font-normal text-2xl normal-case tracking-normal data-[variant=legend]:text-2xl">
              Skin tone
            </FieldLegend>
            <RadioGroup
              className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap"
              onValueChange={(value) => {
                const index = Number(value);
                toneIndex.current = index;
                setTone(index);
                paint();
              }}
              value={String(tone)}
            >
              {tones.map((option, index) => (
                <FieldLabel
                  className="cursor-pointer rounded-full border border-border py-1.5 pr-4 pl-1.5 font-normal normal-case tracking-normal transition-colors has-data-checked:border-foreground has-data-checked:bg-transparent has-focus-visible:ring-2 has-focus-visible:ring-ring"
                  htmlFor={`${toneName}-${index}`}
                  key={option.name}
                >
                  <RadioGroupItem
                    className="size-7 border-0 ring-1 ring-black/10 after:hidden focus-visible:ring-0 [&_[data-slot=radio-group-indicator]]:size-full [&_[data-slot=radio-group-indicator]_span]:bg-white/90"
                    id={`${toneName}-${index}`}
                    style={{
                      background: `linear-gradient(135deg, ${option.light}, ${option.deep})`,
                    }}
                    value={String(index)}
                  />
                  <span className="self-center text-sm">{option.name}</span>
                </FieldLabel>
              ))}
            </RadioGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="font-heading font-normal text-2xl normal-case tracking-normal data-[variant=legend]:text-2xl">
              Shade <span className="text-shade-ink italic">{shade.name}</span>
            </FieldLegend>
            <RadioGroup
              aria-label="Shade"
              className="grid w-fit grid-cols-6 gap-2.5"
              onValueChange={pickShade}
              value={shade.slug}
            >
              {shades.map((option) => (
                <RadioGroupItem
                  aria-label={option.name}
                  className="size-9 border-0 ring-1 ring-black/10 ring-offset-2 ring-offset-background transition-shadow after:hidden focus-visible:ring-2 focus-visible:ring-ring data-checked:ring-2 data-checked:ring-foreground [&_[data-slot=radio-group-indicator]]:size-full [&_[data-slot=radio-group-indicator]_span]:bg-porcelain"
                  key={option.slug}
                  style={{ backgroundColor: option.color }}
                  value={option.slug}
                />
              ))}
            </RadioGroup>
          </FieldSet>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="h-12 rounded-full px-7 text-sm normal-case tracking-normal"
              data-roll
              onClick={() => addSwatch.current()}
              variant="outline"
            >
              <RollText>Add a swatch</RollText>
            </Button>
            <Button
              className="h-12 rounded-full px-5 text-sm normal-case tracking-normal"
              data-roll
              disabled={swatched.length === 0}
              onClick={clear}
              variant="ghost"
            >
              <RollText>Clear the card</RollText>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:col-span-7">
          <AspectRatio
            className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)]"
            ratio={4 / 3}
            ref={card}
          >
            <canvas
              aria-label={description}
              className="absolute inset-0 size-full cursor-crosshair touch-none"
              onPointerCancel={end}
              onPointerDown={start}
              onPointerLeave={end}
              onPointerMove={move}
              onPointerUp={end}
              ref={canvas}
              role="img"
            />
            <div
              aria-hidden="true"
              className="stage-grain pointer-events-none absolute inset-0"
            />
            <p
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-5 text-center font-heading text-black/45 text-xl italic transition-opacity duration-700",
                swatched.length > 1 && "opacity-0",
              )}
            >
              Draw across the card
            </p>
          </AspectRatio>
          <p
            aria-live="polite"
            className="min-h-6 text-muted-foreground text-sm"
          >
            {swatched.length
              ? `On the card: ${swatched.join(", ")}.`
              : "The card is clear."}
          </p>
        </div>
      </div>
    </section>
  );
}
