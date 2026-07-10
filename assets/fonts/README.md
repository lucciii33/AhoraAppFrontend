# Fuentes de AHORA

La app usa dos familias (ver `src/theme.ts`):

- **Cormorant Garamond** (serif) → títulos / `font.display`
- **Manrope** (sans) → texto y UI / `font.body`

Estas fuentes **no vienen incluidas** (no se pudieron descargar sin conexión).
Mientras no estén, React Native usa la fuente del sistema (la app funciona igual,
solo cambia la tipografía).

## Cómo añadirlas (pixel-perfect)

1. Descarga los `.ttf` desde Google Fonts:
   - https://fonts.google.com/specimen/Cormorant+Garamond
   - https://fonts.google.com/specimen/Manrope
2. Copia los archivos aquí, en `assets/fonts/`, p. ej.:
   - `CormorantGaramond-Medium.ttf`
   - `Manrope-Regular.ttf`, `Manrope-SemiBold.ttf`, `Manrope-Bold.ttf`
3. Enlázalas:
   ```bash
   npx react-native-asset
   cd ios && pod install
   ```
   (`react-native.config.js` ya apunta a `./assets/fonts/`).
4. En iOS, el nombre PostScript debe coincidir con `font.display` / `font.body`
   en `theme.ts` ("Cormorant Garamond" y "Manrope"). Ajusta si difiere.
