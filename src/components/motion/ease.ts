import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase, DrawSVGPlugin, MotionPathPlugin);

/**
 * Sistema de movimiento de KAZE (un solo lenguaje, el viento):
 *  kz       = cubic-bezier(0.22, 1, 0.36, 1)  → --ease-editorial (entradas)
 *  kzInOut  = cubic-bezier(0.65, 0, 0.35, 1)  → --ease-swap (cambios de estado)
 *
 * Duraciones: hover 150–250 ms · contenido 300–600 ms · revelados 500–900 ms.
 */
CustomEase.create("kz", "0.22, 1, 0.36, 1");
CustomEase.create("kzInOut", "0.65, 0, 0.35, 1");

export const DURATION = { hover: 0.2, content: 0.5, reveal: 0.85 } as const;

export { gsap, ScrollTrigger };
