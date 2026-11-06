import { FAQ } from "@/commerce/faq";
import type { Product } from "@/commerce/products";
import { SITE_DESCRIPTION, SITE_URL } from "@/config/site";
import { SALES_ENABLED } from "@/config/store";

/** Disponibilidad solo si WooCommerce la confirma. Sin reseñas ni puntuaciones. */
function offer(product: Product) {
  return {
    "@type": "Offer",
    price: product.price,
    priceCurrency: product.currency,
    url: product.productUrl && SALES_ENABLED ? product.productUrl : `${SITE_URL}/#cafes`,
    ...(SALES_ENABLED && product.available !== null
      ? { availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
      : {}),
  };
}

export function StructuredData({ products }: { products: Product[] }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "KAZE",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logos/png/kaze-isotipo-negro.png`,
      },
      {
        "@type": "WebSite",
        name: "KAZE",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "es-AR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      ...products.map((product) => ({
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `${SITE_URL}${product.images[0].src}`,
        brand: { "@type": "Brand", name: product.supplier },
        weight: { "@type": "QuantitativeValue", value: product.weightGrams, unitCode: "GRM" },
        offers: offer(product),
      })),
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
