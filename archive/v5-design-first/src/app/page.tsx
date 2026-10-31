import { BrandHeader } from "@/components/BrandHeader";
import { CinematicScrollExperience } from "@/components/cinematic/CinematicScrollExperience";
import { GrindChoice } from "@/components/commerce/GrindChoice";
import { ProductShowcase } from "@/components/commerce/ProductShowcase";
import { ScrollRefresh } from "@/components/motion/ScrollRefresh";
import { Difference } from "@/components/sections/Difference";
import { FinalConversion } from "@/components/sections/FinalConversion";
import { Ritual } from "@/components/sections/Ritual";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * KAZE V5 — Design first, cinematic second.
 * La web es la protagonista; la secuencia de café es la atmósfera del hero.
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
        <Difference />
        <FinalConversion />
      </main>
      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
