import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { PlausibleScript } from "@/components/shared/PlausibleScript";
import { MetaPixel } from "@/components/shared/MetaPixel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skoenhedsklinik-aarhus.dk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Skønhedsklinik Aarhus — Professionel skønhedsbehandling",
    template: "%s | Skønhedsklinik Aarhus",
  },
  description:
    "Certificeret skønhedsklinik i Aarhus C. Specialister i laser hårfjerning, ansigtsbehandlinger, sugaring, tandblegning og meget mere. Registreret hos Styrelsen for Patientsikkerhed.",
  keywords: [
    "skønhedsklinik aarhus",
    "laser hårfjerning aarhus",
    "laser hårfjerning aarhus",
    "ansigtsbehandling aarhus",
    "sugaring aarhus",
    "tandblegning aarhus",
  ],
  authors: [{ name: "Skønhedsklinik Aarhus" }],
  creator: "Skønhedsklinik Aarhus",
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: SITE_URL,
    siteName: "Skønhedsklinik Aarhus",
    title: "Skønhedsklinik Aarhus — Professionel skønhedsbehandling",
    description:
      "Certificeret skønhedsklinik i Aarhus C. Specialister i laser hårfjerning, ansigtsbehandlinger og meget mere.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Skønhedsklinik Aarhus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skønhedsklinik Aarhus",
    description:
      "Certificeret skønhedsklinik i Aarhus C. Specialister i laser hårfjerning og ansigtsbehandlinger.",
    images: ["/images/og-default.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={cn(inter.variable, cormorant.variable)}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
        <PlausibleScript />
        <MetaPixel />
      </body>
    </html>
  );
}

