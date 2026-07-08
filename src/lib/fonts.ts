import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Display face. Cormorant Garamond 400 to 600, italic for concept lines and
 * emphasis words (docs §2.2). Exposed as `--font-cormorant`, wired into the
 * `--font-serif` theme token in globals.css.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

/**
 * Body and UI face. Inter 300 / 400 / 500 (docs §2.2). Exposed as
 * `--font-inter`, wired into the `--font-sans` theme token in globals.css.
 */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-inter",
});
