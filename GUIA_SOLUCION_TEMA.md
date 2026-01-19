# Diagnóstico y Solución del Modo Oscuro (Tailwind v4)

## 1. El Problema Raíz
El botón de cambio de tema no funcionaba visualmente aunque la lógica interna era correcta (los logs mostraban `isDark: true`).

**Causa:**
Tu proyecto utiliza **Tailwind CSS v4**. En esta nueva versión, la configuración antigua `darkMode: 'class'` dentro de `tailwind.config.js` ya no funciona de la misma manera para anular la preferencia del sistema operativo. Tailwind v4 prefiere usar la media query `prefers-color-scheme` automáticamente.

## 2. La Solución
Para forzar el modo manual ("class strategy") en Tailwind v4, se debe definir una "variante personalizada" directamente en el CSS.

**Código añadido en `src/index.css`:**
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Esto le dice a Tailwind: *"Solo aplica los estilos oscuros cuando la clase `.dark` esté presente en el HTML, e ignora la preferencia del sistema operativo"*.

## 3. Preguntas Frecuentes sobre Archivos de Configuración

### ¿Puedo borrar `tailwind.config.js`?
**SÍ.** En Tailwind v4, el objetivo es mover la configuración a CSS.
- **Acción realizada:** He eliminado este archivo.
- **Migración:** He movido tus colores personalizados (`primary`, `bg-main`, etc.) a `src/index.css` dentro de un bloque `@theme`. Así no pierdes tus estilos.

### ¿Puedo borrar `postcss.config.js`?
**NO** en tu configuración actual.
- Tu `package.json` usa `@tailwindcss/postcss`. Este paquete necesita el archivo `postcss.config.js` para cargarse. Si lo borras, Tailwind dejará de funcionar.
- **Nota:** Solo podrías borrarlo si cambiaras tu configuración de Vite para usar `@tailwindcss/vite` en su lugar, pero no es necesario complicarse ahora. Lo he restaurado para garantizar que tu proyecto compile bien.

## 4. Limpieza
- Se han eliminado todos los `console.log` de depuración en `src/utils/theme.js` y `src/contexts/ThemeContext.jsx`.
- El sistema ha quedado limpio, persistente y 100% manual.
