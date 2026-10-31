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
  description:
    "Kaze es una tienda de café de especialidad. El viento trae el aroma antes que la taza.",
  icons: { icon: "/brand/svg/kaze-isotipo-negro.svg" },
};

export const viewport: Viewport = {
  themeColor: "#151311",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${shippori.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
