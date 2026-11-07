# KAZE: lanzamiento comercial

Estado verificado el 2026-11-06. Punto de recuperación: tag de git `pre-commercial-launch-2026-11-06`.

## Cómo funciona

- **Datos:** `src/commerce/products.ts` es la única fuente. Este repositorio se publica: nunca agregar costos, márgenes ni cantidades compradas.
- **Ventas:** abiertas desde el 2026-11-07. Se quitó el interruptor `NEXT_PUBLIC_KAZE_SALES_ENABLED`: si sigue definido en Vercel, se ignora.
- **Estado real:** `src/commerce/woocommerce.ts` lee la API pública de la tienda cada 5 minutos. Si no responde, se usan los datos de `products.ts` sin afirmar stock.
- **Checkout:** solo en WooCommerce. La landing no tiene carrito ni inventario.

| | Comportamiento |
|---|---|
| Precios | Los de WooCommerce. Respaldo en `products.ts`: 22.900 / 22.900 / 26.900 ARS |
| Botón del café | "Elegir molienda" (o "Comprar"): va a la ficha del producto en la tienda |
| Café sin publicar | "Ir a la tienda": va a `/tienda/` |
| Estado | Según el stock de WooCommerce |
| Moliendas | Solo las variantes con stock |
| Enlaces a la tienda | Encabezado, menú móvil, catálogo, cierre, pie y preguntas frecuentes |
| Datos estructurados | `availability` solo si WooCommerce la informa |

Un producto se reconoce en WooCommerce por las palabras de `wooNameTokens`: la URL sale de la tienda, no se escribe a mano.

## Fuentes de los datos

| Café | Ficha | WooCommerce |
|---|---|---|
| Blend Colombia & Brasil | [cafe-blend-colombia-brasil](https://tienda.bell-coffee.com/productos/cafe-blend-colombia-brasil/) | No publicado |
| Perú Cajamarca | [cafe_peru-cajamarca-n8qf7](https://tienda.bell-coffee.com/productos/cafe_peru-cajamarca-n8qf7/) | No publicado |
| Etiopía Tega & Tula | [etiopia-cafe-especial](https://tienda.bell-coffee.com/productos/etiopia-cafe-especial/) | [etiopia-tega-tula](https://tienda.kazecoffee.shop/producto/etiopia-tega-tula/) |

Las texturas de "A tu manera" salen de la página 4 de la guía KAZE Home Barista.

## Datos que no coinciden entre fuentes

La landing usa la ficha web de Bell. Confirmar contra las bolsas reales cuando lleguen.

| Dato | Ficha web de Bell | Otra fuente |
|---|---|---|
| Etiopía, puntaje | 81,5 SCA | La segunda foto de WooCommerce dice SCA 88 |
| Etiopía, notas | Cítricos, té negro, miel | Esa foto: chocolate y pomelo. Bolsa de la landing: agrega pomelo |
| Etiopía, acidez | Baja | Etiquetas: media / dulce |
| Etiopía, certificación | No menciona | Esa foto: "certificada como orgánica" |
| Perú, certificación | No menciona | La bolsa dice "orgánico" y lleva un sello |

La landing no menciona ninguna certificación.

## Fotografías

Están en `public/products/` y se sirven con `next/image`. La landing las rotula como imagen ilustrativa porque no parecen fotos de las bolsas reales:

- **Etiopía:** el texto de la etiqueta está deformado ("Ispedute del narcimento", "spoyandig"). Es la misma etiqueta que la primera imagen de WooCommerce.
- **Perú:** mide 640×960 y se ve blanda en pantallas grandes. Reemplazar por una de al menos 1600 px de ancho.
- **WooCommerce:** la segunda foto de Etiopía muestra una bolsa de 1 kg, y el producto se vende en 250 g.

Lo ideal es fotografiar las bolsas reales al recibirlas y reemplazar los archivos con el mismo nombre.

## Guía KAZE Home Barista

La landing solo publica la portada y dos páginas como imagen (`public/guide/`). El PDF no está en el repositorio ni en `public/`. **La entrega al comprador no está configurada ni probada.**

Opción recomendada en WooCommerce, sin instalar nada:

1. Subir el PDF como archivo descargable. WooCommerce lo guarda en una carpeta protegida.
2. Elegir el método de descarga "Forzar descargas" en Ajustes > Productos > Productos descargables.
3. Marcar cada variante como descargable y asociarle el archivo, con un límite de descargas razonable.
4. Hacer un pedido de prueba y confirmar que el enlace llega en el correo del pedido.
5. Confirmar que la URL directa del archivo no abre sin pasar por el pedido.

Marcar un producto físico como descargable no quita el envío, siempre que no se marque como virtual.

La guía se presenta como "regalo de bienvenida" y "para tu primera compra", y la landing dice "con tu compra". Decidir si se entrega en toda compra o solo en la primera y alinear los textos.

## Antes de activar las ventas

- [ ] **Stock de Etiopía:** las 5 variantes figuran con stock de 1, compradas por separado podrían sumar más que las bolsas reales. Usar stock compartido en el producto.
- [ ] **Carrito público:** con la tienda en "Próximamente", la API informa el producto como comprable. Confirmar que no se pueda comprar antes de abrir.
- [ ] Publicar Blend y Perú en WooCommerce con sus moliendas. Se conectan solos si el nombre contiene "blend, colombia, brasil" o "peru, cajamarca".
- [ ] Corregir la galería de Etiopía y borrar el comentario "Precio pendiente" de su descripción.
- [ ] Salir del modo "Próximamente" y revisar envíos, cambios, términos y arrepentimiento, porque hoy no se pueden leer públicamente.
- [ ] Configurar y probar la entrega de la guía.
- [ ] Hacer una compra real de punta a punta.
- [ ] Definir `NEXT_PUBLIC_KAZE_SALES_ENABLED=true` en Vercel y volver a desplegar.

## Publicación

- El dominio configurado es `https://www.kazecoffee.shop`. `kazecoffee.shop` sin `www` no respondió desde esta PC: revisar la redirección.
- Solo se indexa el deploy de producción de Vercel (`VERCEL_ENV=production`). Las vistas previas llevan `noindex`.
- El hero conserva la marca de agua de Kling en los clips de origen. Revisarlo antes de pautar.
