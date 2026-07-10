import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getAnnouncement, getSiteSettings } from "@/sanity/lib/queries";

/**
 * Public site shell (docs §11.2): the fixed header (with the §4.2 announcement
 * slot) floats over the content, the canonical footer (`id="contact"`) closes
 * every page with the siteSettings visit line. Presentation preview mounts the
 * visual-editing overlays under Draft Mode (§11.5).
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, announcement, { isEnabled: isDraft }] = await Promise.all([
    getSiteSettings(),
    getAnnouncement(),
    draftMode(),
  ]);

  return (
    <>
      <SiteHeader announcement={announcement} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
      {isDraft && (
        <>
          <VisualEditing />
          {/* Editor-only chrome: the Presentation tool sets a browser-wide
              Draft Mode cookie; this is the way back out. */}
          <a
            href="/api/draft-mode/disable"
            className="bg-champagne text-ink hover:bg-champagne-bright fixed right-5 bottom-5 z-[300] px-4 py-2.5 text-[9.5px] font-medium tracking-[0.22em] uppercase transition-colors"
          >
            Exit draft mode
          </a>
        </>
      )}
    </>
  );
}
