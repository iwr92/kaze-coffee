import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Shippori_Mincho_B1 } from "next/font/google";
import { SITE_DESCRIPTION, SITE_INDEXABLE, SITE_TITLE, SITE_URL } from "@/config/site";
import "./globals.css";

const shippori = Shippori_Mincho_B1({
  variable: "--font-shippori",
  weight: ["500", "600", "800"],
  subsets: ["latin"],
  display: "swap",
});

/* Variable: peso 400–700, ancho 75–100 y cursiva real. La cursiva estrecha es
   la segunda voz de los titulares (Shippori no tiene cursiva). */
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["wdth"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  robots: SITE_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  icons: { icon: "/brand/logos/svg/kaze-isotipo-negro.svg" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "KAZE",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og/kaze-og.jpg", width: 1200, height: 630, alt: "KAZE, café de especialidad, a tu ritmo." }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og/kaze-og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
  width: "device-width",
  initialScale: 1,
};

const INTRO_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("kz-intro-pending")}catch(e){}`;
/* Si el JS nunca llega, el CSS revela el titular por su cuenta (kz-reveal-failsafe). */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${shippori.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        {/* Antes del primer pintado: el titular del hero arranca oculto para su
            entrada orquestada. Sin JS o con movimiento reducido, no se aplica. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
