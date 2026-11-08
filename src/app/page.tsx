import { resolveCatalog } from "@/commerce/woocommerce";
import { BrandHeader } from "@/components/BrandHeader";
import { CinematicScrollExperience } from "@/components/cinematic/CinematicScrollExperience";
import { GrindChoice } from "@/components/commerce/GrindChoice";
import { ProductShowcase } from "@/components/commerce/ProductShowcase";
import { ScrollRefresh } from "@/components/motion/ScrollRefresh";
import { Difference } from "@/components/sections/Difference";
import { Faq } from "@/components/sections/Faq";
import { FinalConversion } from "@/components/sections/FinalConversion";
import { HomeBarista } from "@/components/sections/HomeBarista";
import { KazeEnCasa } from "@/components/sections/KazeEnCasa";
import { Ritual } from "@/components/sections/Ritual";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";

/** Con ventas activas, el estado de la tienda se refresca cada 5 minutos. */
export const revalidate = 300;

/** KAZE: landing comercial. La compra termina siempre en WooCommerce. */
export default async function Home() {
  const products = await resolveCatalog();
  return (
    <>
      <StructuredData products={products} />
      <BrandHeader />
      <main>
        <CinematicScrollExperience />
        <KazeEnCasa />
        <TrustStrip />
        <ProductShowcase products={products} />
        <GrindChoice />
        <HomeBarista />
        <Ritual />
        <Difference />
        <Faq />
        <FinalConversion />
      </main>
      <SiteFooter />
      <ScrollRefresh />
    </>
  );
}
