import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import config from "@/lib/config";

const font = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: `${config.appName} — ${config.tagline}`,
  description:
    "Generate and edit photoreal images from plain language. Powered by the nano banana image model on fal.ai.",
  openGraph: {
    title: `${config.appName} — ${config.tagline}`,
    description:
      "Generate and edit photoreal images from plain language. Powered by the nano banana image model.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  const theme = process.env.NEXT_PUBLIC_THEME || "banana";

  return (
    <html lang="en" data-theme={theme} className={font.variable}>
      <body className="min-h-dvh flex flex-col bg-bg-page text-primary-text antialiased">
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
