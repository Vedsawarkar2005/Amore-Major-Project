import { HeroStory } from "@/features/landing/hero/hero-story";
import { Assurance } from "@/features/landing/sections/assurance";
import { ClosingCta } from "@/features/landing/sections/closing-cta";
import { ComingSoon } from "@/features/landing/sections/coming-soon";
import { FaqPreview } from "@/features/landing/sections/faq-preview";
import { Formula } from "@/features/landing/sections/formula";
import { Founders } from "@/features/landing/sections/founders";
import { IngredientTicker } from "@/features/landing/sections/ingredient-ticker";
import { Newsletter } from "@/features/landing/sections/newsletter";
import { Ritual } from "@/features/landing/sections/ritual";
import { ShadeFamilies } from "@/features/landing/sections/shade-families";
import { ShadeGallery } from "@/features/landing/sections/shade-gallery";
import { SwatchStudioClient } from "@/components/swatch-studio-client";

export default function HomePage() {
  return (
    <>
      <HeroStory />
      <div id="hero-scroll-end" className="w-full h-px pointer-events-none" aria-hidden="true" />
      <IngredientTicker />
      <ShadeGallery />
      <SwatchStudioClient />
      <Formula />
      <Ritual />
      <Founders />
      <ShadeFamilies />
      <ComingSoon />
      <Assurance />
      <FaqPreview />
      <Newsletter />
      <ClosingCta />
    </>
  );
}
