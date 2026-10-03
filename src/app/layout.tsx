import type { Metadata, Viewport } from "next";
import { Spline_Sans_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppFrame } from "./app-frame";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const spline = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-spline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spend — Personal Ledger",
  description:
    "A local-first expense ledger with animated insights, budgets and analytics. Your data never leaves your device.",
};

export const viewport: Viewport = {
  themeColor: "#f2edde",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${spline.variable}`}>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
