import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

// Primary body font — Montserrat from the Amore brand guide.
const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Display/heading font — Playfair Display, both roman and italic
// (italic is used on the hero stage for the shade names).
const fontHeading = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AMORE COSMETICS — Love For Your Lips | Hydravelvet Collection",
    template: "%s · Amore Cosmetics",
  },
  description:
    "Luxury minimalist lip care formulated by cosmetologists. Infused with Blueberry Butter, Avocado Oil, and Vitamin E.",
  keywords: [
    "Amore Cosmetics",
    "Hydravelvet",
    "velvet lipstick",
    "matte lipstick India",
    "moisturising lipstick",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    siteName: "Amore Cosmetics",
    type: "website",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Amore Hydravelvet Lipstick: a veil of care, a touch of colour.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#000000", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground flex flex-col">
        {/*
         * Lenis smooth scroll, driven by GSAP's ticker so scroll-scrubbed
         * hero animations glide. Respects prefers-reduced-motion.
         */}
        <SmoothScroll />
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
