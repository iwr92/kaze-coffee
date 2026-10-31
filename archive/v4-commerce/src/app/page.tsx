import { BrandHeader } from "@/components/BrandHeader";
import { CinematicScrollExperience } from "@/components/cinematic/CinematicScrollExperience";
import { GrindChoice } from "@/components/commerce/GrindChoice";
import { ProductShowcase } from "@/components/commerce/ProductShowcase";
import { ScrollRefresh } from "@/components/motion/ScrollRefresh";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * KAZE V4 — Editorial Commerce.
 * El hero cinematográfico presenta la marca; la oferta llega enseguida.
 * Próximas secciones planificadas (sin implementar): The Ritual, The
 * Difference y Discover KAZE. Ver docs/v4/README.md.
 */
export default function Home() {
  return (
    <>
      <BrandHeader />
      <main>
        <CinematicScrollExperience />
        <ProductShowcase />
        <GrindChoice />
      </main>
      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
