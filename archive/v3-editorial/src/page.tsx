import { BrandHeader } from "@/components/BrandHeader";
import { CinematicScrollExperience } from "@/components/cinematic/CinematicScrollExperience";
import { FinalCTA } from "@/components/FinalCTA";
import { ScrollRefresh } from "@/components/motion/ScrollRefresh";
import { GrindSelector } from "@/components/sections/GrindSelector";
import { Manifesto } from "@/components/sections/Manifesto";
import { Origin } from "@/components/sections/Origin";
import { TastingNotes } from "@/components/sections/TastingNotes";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * KAZE V3. Recorrido: el grano se vuelve taza (hero cinematográfico),
 * el viento (manifiesto), el origen, la molienda, las notas y el ritual.
 */
export default function Home() {
  return (
    <>
      <BrandHeader />
      <main>
        <CinematicScrollExperience />
        <Manifesto />
        <Origin />
        <GrindSelector />
        <TastingNotes />
        <FinalCTA />
      </main>
      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
