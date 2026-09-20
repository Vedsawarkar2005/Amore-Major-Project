import { landingSiteConfig } from "@amore/config/site";
import { ThemeSwitcher } from "@amore/ui/components/theme-switcher";
import { headers } from "next/headers";
import { hostnameFromHost, isLandingHostname, storeOriginForHostname } from "@/lib/domain-routing";

export default async function LandingPage() {
  const hostname = hostnameFromHost((await headers()).get("host") ?? "localhost");
  const storeUrl = isLandingHostname(hostname) ? storeOriginForHostname(hostname) : "/store";
  return (
    <main className="p-6">
      <h1 className="font-bold text-4xl">{landingSiteConfig.title}</h1>
      <p className="mt-4">Discover Amore Cosmetics.</p>
      <a className="mt-6 inline-block underline" href={storeUrl}>
        Shop online
      </a>
      <ThemeSwitcher className="ml-2" />
    </main>
  );
}
