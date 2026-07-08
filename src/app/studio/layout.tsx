import type { Metadata } from "next";

/** /studio is a private editing surface: keep it out of the index (docs §12). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
