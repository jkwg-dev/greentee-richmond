import type { Metadata } from "next";
import { cormorant, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GreenTee Richmond Center · Indoor Golf Club",
    template: "%s · GreenTee Richmond Center",
  },
  description:
    "A premium indoor golf club in Richmond. Tour-grade simulator bays, private VIP rooms, and year-round play, with Crystal Jade Palace on the promenade.",
  metadataBase: new URL("https://greentee-richmond.example"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {/* Set the reduced-motion flag before paint so `html.rm` rules apply
            without a flash of animation (docs §9.5). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('rm')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
