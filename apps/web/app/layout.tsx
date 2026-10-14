import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Raleway, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@repo/ui/lib/utils";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@repo/ui/components/toast";
import SideRays from "@/components/ui/SideRays";
import { SITE_URL, CHURCH_NAME, CHURCH_DESCRIPTION } from "@/lib/seo-config";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${CHURCH_NAME}`,
    default: `${CHURCH_NAME} — Arrow of Deliverance Ministries International`,
  },
  description: CHURCH_DESCRIPTION,
  keywords: [
    "Arrow of Deliverance Ministries",
    "Arrow of Deliverance Ministries International",
    "ADMI",
    "ADM Global",
    "Victory Chapel",
    "Victory Family",
    "ADMI Victory Chapel",
    "Victory Chapel Jalingo",
    "church in Jalingo",
    "Taraba State church",
    "Nigerian church",
    "Pastor Joseph Nwunuji",
    "sermons",
    "gospel",
    "Christian church Nigeria",
    "deliverance ministry",
    "prayer",
    "Bible study",
    "worship",
  ],
  authors: [{ name: CHURCH_NAME, url: SITE_URL }],
  creator: CHURCH_NAME,
  publisher: CHURCH_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: CHURCH_NAME,
    title: `${CHURCH_NAME} — Arrow of Deliverance Ministries International`,
    description: CHURCH_DESCRIPTION,
    images: [
      {
        url: "/admi-logo.png",
        width: 512,
        height: 512,
        alt: `${CHURCH_NAME} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${CHURCH_NAME} — Arrow of Deliverance Ministries International`,
    description: CHURCH_DESCRIPTION,
    images: ["/admi-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "religion",
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-title": CHURCH_NAME,
  },
};

/** JSON-LD structured data for the church (Organization + Church schema) */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Church", "Organization"],
  name: "Arrow of Deliverance Ministries International",
  alternateName: [
    "ADMI",
    "ADM Global",
    "Victory Chapel",
    "Victory Family",
    "ADMI Victory Chapel",
  ],
  url: SITE_URL,
  logo: `${SITE_URL}/admi-logo.png`,
  image: `${SITE_URL}/admi-logo.png`,
  description: CHURCH_DESCRIPTION,
  foundingDate: "2000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Opposite State Polytechnic",
    addressLocality: "Jalingo",
    addressRegion: "Taraba State",
    addressCountry: "NG",
  },
  telephone: "+234-902-901-8318",
  email: "info@amdi.com",
  sameAs: [
    "https://www.youtube.com/@arrowofdeliveranceministries",
    "https://web.facebook.com/ADMIvictorychapel",
    "https://www.instagram.com/victory.chapel_tv",
    "https://www.tiktok.com/@victory.chapel_tv",
  ],
  member: [
    {
      "@type": "Person",
      name: "Pastor Joseph M. Nwunuji",
      jobTitle: "Senior Pastor",
    },
    {
      "@type": "Person",
      name: "Pastor Mrs. Christable Joseph",
      jobTitle: "Senior Pastor",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        geistHeading.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full w-full flex flex-col">
        {/* JSON-LD Structured Data for Search Engines and AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {/* Light rays effect */}
          <SideRays
            className="z-1"
            speed={2.5}
            rayColor1="#EAB308"
            rayColor2="#96c8ff"
            intensity={2}
            spread={2}
            origin="top-right"
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={1}
          />

          <SideRays
            className="z-1"
            speed={2.5}
            rayColor1="#EAB308"
            rayColor2="#96c8ff"
            intensity={2}
            spread={2}
            origin="top-left"
            tilt={0}
            saturation={1.5}
            blend={0.75}
            falloff={1.6}
            opacity={1}
          />
          <main className="z-10">{children}</main>
          <Toaster />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
