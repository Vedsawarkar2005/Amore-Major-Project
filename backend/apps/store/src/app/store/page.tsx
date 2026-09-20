import { storeSiteConfig } from "@amore/config/site";

export default function StorePage() {
  return (
    <main className="p-6">
      <h1 className="font-bold text-4xl">{storeSiteConfig.title}</h1>
    </main>
  );
}
