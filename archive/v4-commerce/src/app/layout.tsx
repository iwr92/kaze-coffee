import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";

const shippori = Shippori_Mincho_B1({
  variable: "--font-shippori",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaze — Café de especialidad, a tu ritmo",
  description: "Cafés de especialidad seleccionados para disfrutar a tu ritmo.",
  icons: { icon: "/brand/logos/svg/kaze-isotipo-negro.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
  width: "device-width",
  initialScale: 1,
};

const INTRO_SCRIPT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("kz-intro-pending")}catch(e){}`;

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
