import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amorecosmetics.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/hydravelvet", destination: "/shop", permanent: true },
      { source: "/hydravelvet/:shade", destination: "/shop", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
      { source: "/shipping", destination: "/shipping-and-delivery", permanent: true },
      { source: "/refunds", destination: "/cancellation-and-refund", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: false },
    ];
  },
};

export default nextConfig;
