// import type { Metadata } from "next";
// import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
// import "./globals.css";
// import { cn } from "@/lib/utils";
// import { SEO_DEFAULTS, SITE } from "@/lib/constants";
// import { ThemeProvider } from "@/components/layout/theme-provider";
// import { PageTransition } from "@/components/layout/page-transition";
// import { AnalyticsProvider } from "@/components/layout/analytics-provider";
// import { Navbar } from "@/components/layout/navbar";
// import { Footer } from "@/components/layout/footer";
// import { Toaster } from "@/components/ui/toaster";

// const fraunces = Fraunces({
//   subsets: ["latin"],
//   variable: "--font-fraunces",
//   axes: ["opsz", "SOFT", "WONK"],
//   display: "swap",
// });
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

// export const metadata: Metadata = {
//   metadataBase: new URL(SITE.url),
//   title: { default: SEO_DEFAULTS.defaultTitle, template: SEO_DEFAULTS.titleTemplate },
//   description: SEO_DEFAULTS.description,
//   openGraph: {
//     title: SEO_DEFAULTS.defaultTitle,
//     description: SEO_DEFAULTS.description,
//     url: SITE.url,
//     siteName: SITE.name,
//     images: [{ url: SEO_DEFAULTS.ogImage }],
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: SEO_DEFAULTS.defaultTitle,
//     description: SEO_DEFAULTS.description,
//   },
//   robots: { index: true, follow: true },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={cn(fraunces.variable, inter.variable, jetbrainsMono.variable, "font-sans")}>
//         <ThemeProvider>
//           <AnalyticsProvider>
//             <div className="relative flex min-h-screen flex-col">
//               <Navbar />
//               <main className="flex-1">
//                 <PageTransition>{children}</PageTransition>
//               </main>
//               <Footer />
//             </div>
//             <Toaster />
//           </AnalyticsProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SEO_DEFAULTS, SITE } from "@/lib/constants";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { PageTransition } from "@/components/layout/page-transition";
import { AnalyticsProvider } from "@/components/layout/analytics-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

/**
 * This site's content (projects, posts, bio-adjacent tables, testimonials...)
 * lives in the database and is edited live via /admin — it isn't fixed at
 * build time. Forcing dynamic rendering here means every page renders fresh
 * per request instead of Next.js trying to statically prerender it at
 * `next build` (which would (a) freeze in whatever content existed at build
 * time and (b) hit the database during the build itself — the source of the
 * "Timed out fetching a new connection from the connection pool" build
 * error). `Footer` alone queries `socialLink.findMany()` on every page via
 * this root layout, so the setting belongs here rather than scattered across
 * individual pages.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SEO_DEFAULTS.defaultTitle, template: SEO_DEFAULTS.titleTemplate },
  description: SEO_DEFAULTS.description,
  openGraph: {
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: SEO_DEFAULTS.ogImage }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULTS.defaultTitle,
    description: SEO_DEFAULTS.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fraunces.variable, inter.variable, jetbrainsMono.variable, "font-sans")}>
        <ThemeProvider>
          <AnalyticsProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </div>
            <Toaster />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
