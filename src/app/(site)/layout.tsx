import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Public site shell (docs §11.2): the fixed header floats over the content, the
 * canonical footer (`id="contact"`) closes every page. The announcement bar
 * (docs §4.2) lands in its slot below the header in Phase 6.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {/* AnnouncementBar slot (docs §4.2), added in Phase 6 */}
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
