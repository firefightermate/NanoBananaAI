import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "../components/Navbar";
import CustomCursor from "@/components/ui/CustomCursor";
import config from "@/lib/config";

const font = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://kalium-one.vercel.app"),
  title: `${config.appName} — ${config.tagline}`,
  description:
    "Generate and edit photoreal images from plain language. Powered by Google's nano banana image model. 36 free credits, no card required.",
  keywords: [
    "AI image generator",
    "nano banana",
    "text to image",
    "AI image editing",
    "Gemini image",
  ],
  openGraph: {
    title: `${config.appName} — ${config.tagline}`,
    description:
      "Generate and edit photoreal images from plain language. 36 free credits, no card required.",
    type: "website",
    url: "https://kalium-one.vercel.app",
    images: [{ url: "/og.jpg", width: 1376, height: 768, alt: "Kalium — Type words. Get art." }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.appName} — ${config.tagline}`,
    description:
      "Generate and edit photoreal images from plain language. 36 free credits, no card required.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }) {
  const theme = process.env.NEXT_PUBLIC_THEME || "banana";

  return (
    <html lang="en" data-theme={theme} className={font.variable}>
      <body className="min-h-dvh flex flex-col bg-bg-page text-primary-text antialiased">
        <Providers>
          <CustomCursor />
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
