import { CtaLink } from "@/components/page/cta-link";
import { SplitRow } from "@/components/page/split-row";
import { hydravelvet, type IngredientSlug } from "@/content/hydravelvet";

import { type Floater, FloatField } from "../float/float-field";
import { ingredientArt } from "../ingredients/ingredient-art";

// Stray ingredients at the section's edges, out of the way of the rows.
const floaters: Floater[] = [
  {
    kind: "blueberry",
    left: "93%",
    top: "3%",
    width: "clamp(3.5rem,7vw,7rem)",
    depth: 1.45,
    tilt: 18,
  },
  {
    kind: "drop",
    left: "-1%",
    top: "44%",
    width: "clamp(1.5rem,2.5vw,2.5rem)",
    depth: 0.6,
    tilt: -12,
    wideOnly: true,
  },
  {
    kind: "avocado",
    left: "-3%",
    top: "86%",
    width: "clamp(3rem,6vw,6rem)",
    depth: 1.25,
    tilt: -30,
  },
  {
    kind: "blueberry",
    left: "58%",
    top: "7%",
    width: "clamp(1rem,1.6vw,1.6rem)",
    depth: 0.45,
    tilt: 0,
    wideOnly: true,
  },
];

// A wash behind each ingredient's drawing that evokes it (not product claims).
const washes: Record<IngredientSlug, string> = {
  "blueberry-butter":
    "radial-gradient(circle at 30% 25%, #d9d2ec, #b3a6d6 70%)",
  "avocado-oil": "radial-gradient(circle at 30% 25%, #e7ebc6, #c4cc8a 70%)",
  "vitamin-e": "radial-gradient(circle at 30% 25%, #fbeccb, #eccb86 70%)",
};

/**
 * The three ingredients as an editorial list: name, what it does and why,
 * and a plate with its drawing, one row each between hairlines.
 */
export function Formula() {
  return (
    <section
      aria-labelledby="formula-title"
      className="relative overflow-hidden bg-porcelain dark:bg-muted"
    >
      <FloatField parallax pieces={floaters} />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 py-28">
        <SplitRow id="formula-title" title="What's inside">
          Three ingredients chosen for comfort as much as colour, so a velvet
          finish never has to feel dry.
        </SplitRow>

        <ul className="border-border border-t">
          {hydravelvet.ingredients.map((ingredient) => {
            const Art = ingredientArt[ingredient.slug];
            return (
              <li
                className="grid grid-cols-1 gap-6 border-border border-b py-10 md:grid-cols-12 md:items-start md:gap-8"
                key={ingredient.slug}
              >
                <h3 className="font-heading text-[clamp(2.5rem,4.5vw,4.25rem)] text-shade-ink leading-[0.95] md:col-span-5">
                  {ingredient.name}
                </h3>
                <div className="flex max-w-md flex-col gap-3 md:col-span-4 md:pt-2">
                  <p className="text-lg">{ingredient.summary}</p>
                  <p className="indent-10 text-muted-foreground">
                    {ingredient.detail}
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg md:col-span-3"
                  style={{ background: washes[ingredient.slug] }}
                >
                  <Art className="w-1/2 drop-shadow-[0_18px_24px_rgb(0_0_0/0.25)]" />
                  <div className="stage-grain absolute inset-0" />
                </div>
              </li>
            );
          })}
        </ul>

        <div>
          <CtaLink href="/ingredients" variant="outline">
            More about the formula
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
