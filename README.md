# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Pastelería (React + TypeScript + Vite)

    Este repositorio contiene una pequeña aplicación de ejemplo para una pastelería, construida con React, TypeScript y Vite. Incluye páginas, componentes y utilidades típicas (carrito, productos, registro, contacto, administración básica), además de una suite de pruebas automatizadas con Vitest + Testing Library.

    ## Estructura resumida
    - `src/components/` — Componentes reutilizables (tarjetas de producto, formularios de administración, layout).
    - `src/pages/` — Páginas principales (Inicio, Productos, Producto, Carrito, Registro, Contacto, Perfil, blog y paneles de admin/vendedor).
    - `src/utils/` — Utilidades (formato de dinero, fechas, almacenamiento en localStorage, generación de recibo, validadores).
    - `test/` — Pruebas unitarias y de componentes (ver lista más abajo).

    ## Ejecutar la aplicación

    Instalar dependencias:

    ```cmd
    npm install
    ```

    Ejecutar en modo desarrollo:

    ```cmd
    npm run dev
    ```

    Construir para producción:

    ```cmd
    npm run build
    npm run preview
    ```

    ## Ejecutar pruebas

    Usar Vitest directamente (se requiere Node 20+ para reproducir el entorno CI):

    ```cmd
    npx vitest --run --reporter verbose
    ```

    O con npm script (si lo agregas):

    ```cmd
    npm test
    ```

    ## Las 10 pruebas unitarias principales

    Este proyecto mantiene exactamente 10 archivos de test principales, agrupados en `components`, `pages` y `utils`. A continuación se listan con una breve descripción de qué cubre cada uno:

    - `test/utils/format.test.ts` — Verifica `formatMoney(value)` produce una cadena de moneda sin decimales fraccionarios.
    - `test/utils/receipt.test.ts` — Verifica `buildReceiptHTML(payload)` incluye nombres de productos, totales y correo cuando corresponde (salida HTML del recibo).
    - `test/utils/dates.test.ts` — Pruebas de `parseLocalDate`, `computeAge` e `isBirthdayToday` con tiempo controlado por fake timers.
    - `test/utils/storage.test.ts` — Pruebas de `readJSON`, `writeJSON` y `removeKey` usando un mock de `localStorage`.
    - `test/utils/validators.test.ts` — Pruebas de `cleanRun` e `isRunValid` (validación de RUN/RUT).
    - `test/components/ProductCard.test.tsx` — Prueba de renderizado de `ProductCard` y que llama a `addToCart`.
    - `test/components/ProductCreateForm.test.tsx` — Valida el formulario de creación de producto (validaciones de precio y no llamar a `upsertProduct` cuando es inválido).
    - `test/pages/RegistroPage.test.tsx` — Verifica que el select de región habilita comunas y que la validación impide enviar formulario incompleto.
    - `test/pages/ContactoPage.test.tsx` — Verifica validación del formulario de contacto y muestra de flash de éxito (se ha protegido con `act` y fake timers).
    - `test/pages/CarritoPage.test.tsx` — Flujo de checkout: abre recibo, actualiza stock del producto y limpia carrito.

    Estas pruebas cubren utilidades críticas, componentes clave del catálogo/carrito y las interacciones principales en páginas importantes.

    ## Notas adicionales
    - Las pruebas están preparadas para ejecutarse en un entorno con Node 20 (el workflow de CI usa Ubuntu con Node 20). Si tus tests fallan localmente, verifica la versión con `node -v`.
    - Algunas advertencias (future flags de React Router o recordatorios de `act`) son informativas y no afectan el resultado de las pruebas.
    - Si deseas convertir alguna prueba de integración (p. ej. pages) a pruebas más unitarias y aisladas, puedo proponerte cómo extraer lógica o añadir más mocks.

    Si quieres que actualice el `package.json` añadiendo un script `test` o que genere un pequeño badge de estado en la cabecera, lo hago a continuación.
