import { getSite } from "@/lib/content";

/**
 * Scaffold placeholder. The Phase 1 migration replaces this with the ported
 * dining landing (hero, intro, signature trio, private dining preview).
 */
export default function HomePage() {
  const site = getSite();
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl tracking-wide">{site.name}</h1>
      <p className="text-mist text-sm">{site.tagline}</p>
    </main>
  );
}
