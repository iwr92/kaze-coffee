import { BrandHeader } from "@/components/BrandHeader";
import { CinematicScrollExperience } from "@/components/cinematic/CinematicScrollExperience";
import { GrindChoice } from "@/components/commerce/GrindChoice";
import { ProductShowcase } from "@/components/commerce/ProductShowcase";
import { ScrollRefresh } from "@/components/motion/ScrollRefresh";
import { DiscoverCoffee } from "@/components/sections/DiscoverCoffee";
import { FinalConversion } from "@/components/sections/FinalConversion";
import { Ritual } from "@/components/sections/Ritual";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * KAZE V6 — Motion editorial.
 * Un solo lenguaje de movimiento (el viento) recorre la página: del hero a
 * la colección, A tu manera, el ritual, Descubrí tu café y el cierre.
 */
export default function Home() {
  return (
    <>
      <BrandHeader />
      <main>
        <CinematicScrollExperience />
        <ProductShowcase />
        <GrindChoice />
        <Ritual />
        <DiscoverCoffee />
        <FinalConversion />
      </main>
      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
