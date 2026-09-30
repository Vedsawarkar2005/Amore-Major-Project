import { SplitRow } from "@/components/page/split-row";

import { RitualScene } from "../ritual/ritual-scene";

export function Ritual() {
  return (
    <section
      aria-labelledby="ritual-title"
      className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-28"
    >
      <SplitRow id="ritual-title" title="Centre out, then define">
        Three steps for an even, velvety wear. Scroll to see them played out.
      </SplitRow>
      <RitualScene />
    </section>
  );
}
