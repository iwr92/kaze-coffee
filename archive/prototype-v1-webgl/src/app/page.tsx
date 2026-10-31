import { CatalogSection } from "@/components/CatalogSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Experience } from "@/experience/Experience";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Experience />
        <CatalogSection />
      </main>
      <SiteFooter />
    </>
  );
}
