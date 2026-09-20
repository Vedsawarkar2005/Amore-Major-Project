import { adminSiteConfig } from "@amore/config/site";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="font-bold text-4xl">{adminSiteConfig.title}</h1>
    </main>
  );
}
