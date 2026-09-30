"use client";

import { cn } from "@/lib/utils";
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";

/*
 * Particles, from the Magic UI registry (@magicui/particles), reworked for
 * this project's performance rules:
 *   - the pointer is tracked in a ref, so moving the mouse never re-renders;
 *   - the animation loop runs only while the field is on screen and the tab
 *     is visible;
 *   - with reduced motion the field is drawn once and holds still;
 *   - it re-scatters when its own box resizes, not only the window.
 * The props are unchanged from the registry version.
 */

type ParticlesProps = ComponentPropsWithoutRef<"div"> & {
  /** How many particles. */
  quantity?: number;
  /** How little the particles follow the pointer (higher is stiller). */
  staticity?: number;
  /** How slowly they catch up with the pointer (higher is slower). */
  ease?: number;
  /** Base radius in CSS pixels; each particle adds 0–1 to it. */
  size?: number;
  /** Change it to scatter a fresh set of particles. */
  refresh?: boolean;
  /** Particle colour as a hex string. */
  color?: string;
  /** Constant drift, in pixels per frame. */
  vx?: number;
  vy?: number;
};

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

function hexToRgb(hex: string) {
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const int = Number.parseInt(value, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].join(", ");
}

/** `value` mapped from [0, `from`] onto [0, 1], never below 0. */
const fade = (value: number, from: number) => Math.max(value / from, 0);

/**
 * A field of soft particles that drift and lean toward the pointer. Fills
 * its container (size it with `className`); decorative, so it's hidden from
 * assistive technology.
 */
export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  ...props
}: ParticlesProps) {
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `refresh` is a trigger, only read to re-scatter
  useEffect(() => {
    const box = container.current;
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!(box && element && context)) return;

    const rgb = hexToRgb(color);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0 };
    let circles: Circle[] = [];
    let width = 0;
    let height = 0;
    let frame: number | undefined;
    let onScreen = false;

    const create = (): Circle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: still.matches ? Math.random() * 0.6 + 0.1 : 0,
      targetAlpha: Number((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    });

    const draw = (circle: Circle) => {
      context.beginPath();
      context.arc(
        circle.x + circle.translateX,
        circle.y + circle.translateY,
        circle.size,
        0,
        Math.PI * 2,
      );
      context.fillStyle = `rgba(${rgb}, ${circle.alpha})`;
      context.fill();
    };

    const scatter = () => {
      const dpr = window.devicePixelRatio || 1;
      width = box.offsetWidth;
      height = box.offsetHeight;
      element.width = width * dpr;
      element.height = height * dpr;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      circles = Array.from({ length: quantity }, create);
      context.clearRect(0, 0, width, height);
      for (const circle of circles) draw(circle);
    };

    const step = () => {
      context.clearRect(0, 0, width, height);
      circles.forEach((circle, index) => {
        // Fade in, and fade out near the edges.
        const edge = Math.min(
          circle.x + circle.translateX - circle.size,
          width - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          height - circle.y - circle.translateY - circle.size,
        );
        const near = fade(edge, 20);
        circle.alpha =
          near > 1
            ? Math.min(circle.alpha + 0.02, circle.targetAlpha)
            : circle.targetAlpha * near;
        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX +=
          (pointer.x / (staticity / circle.magnetism) - circle.translateX) /
          ease;
        circle.translateY +=
          (pointer.y / (staticity / circle.magnetism) - circle.translateY) /
          ease;

        const gone =
          circle.x < -circle.size ||
          circle.x > width + circle.size ||
          circle.y < -circle.size ||
          circle.y > height + circle.size;
        const next = gone ? create() : circle;
        circles[index] = next;
        draw(next);
      });
      frame = requestAnimationFrame(step);
    };

    const run = () => {
      const should = onScreen && !still.matches && !document.hidden;
      if (should && frame === undefined) frame = requestAnimationFrame(step);
      if (!should && frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
    };

    const follow = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - width / 2;
      const y = event.clientY - rect.top - height / 2;
      if (Math.abs(x) < width / 2 && Math.abs(y) < height / 2) {
        pointer.x = x;
        pointer.y = y;
      }
    };

    // Watches the field itself, not the window: its section can change
    // height without a window resize (fonts loading, text reflowing). The
    // first report (on observe) matches the initial scatter and is skipped.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (box.offsetWidth !== width || box.offsetHeight !== height) scatter();
      }, 200);
    });

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      run();
    });

    scatter();
    visibility.observe(box);
    window.addEventListener("pointermove", follow, { passive: true });
    resize.observe(box);
    document.addEventListener("visibilitychange", run);
    still.addEventListener("change", run);

    return () => {
      visibility.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", follow);
      resize.disconnect();
      document.removeEventListener("visibilitychange", run);
      still.removeEventListener("change", run);
    };
  }, [color, ease, quantity, refresh, size, staticity, vx, vy]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      ref={container}
      {...props}
    >
      <canvas className="size-full" ref={canvas} />
    </div>
  );
}
