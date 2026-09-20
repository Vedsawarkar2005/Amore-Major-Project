import { type NextRequest, NextResponse } from "next/server";
import {
  hostnameFromHost,
  isLandingHostname,
  publicSiteForHostname,
  storeOriginForHostname,
} from "./lib/domain-routing";

const storePrefix = "/store";

/**
 * Keep one Next.js deployment while exposing two independent public URL spaces.
 * Store paths live under /store internally; rewrites keep that prefix out of browser URLs.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const hostname = hostnameFromHost(host);
  const site = publicSiteForHostname(hostname);

  if (site === "store") {
    if (pathname === storePrefix || pathname.startsWith(`${storePrefix}/`)) {
      return NextResponse.next();
    }

    // Preserve the browser host: rewriting to Next's loopback target reruns routing on the wrong site.
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      `${request.nextUrl.protocol}//${host}`,
    );
    destination.pathname = `${storePrefix}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(destination);
  }

  // Prevent the internal route namespace from becoming part of the landing site's public URLs.
  if (
    isLandingHostname(hostname) &&
    (pathname === storePrefix || pathname.startsWith(`${storePrefix}/`))
  ) {
    const publicPath = pathname.slice(storePrefix.length) || "/";
    const destination = new URL(storeOriginForHostname(hostname));
    // Assign pathname instead of resolving a relative URL so // cannot become an external host.
    destination.pathname = publicPath;
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|woff2?)$).*)",
  ],
};
