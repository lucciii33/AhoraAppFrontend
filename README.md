# AHORA — App (React Native CLI)

App devocional cristiana en español (e inglés). Chat con un Compañero
espiritual, camino del día (oración, reflexión, práctica, tarea, recordatorio),
biblioteca de devocionales, racha y avisos.

Construida sobre la base de un proyecto React Native CLI (RN 0.82 + TypeScript),
siguiendo sus convenciones: `src/theme.ts` (tokens), `src/api/*` (axios),
`src/context/AuthContext.tsx`, `src/navigation/*`, `src/screens/*`, `src/components/*`.

## Requisitos
- Node ≥ 20, la CLI de React Native y su entorno (Xcode / Android Studio).
- El backend `ahora-backend` corriendo (por defecto en `http://localhost:5000`).

## Arrancar
```bash
npm install
# iOS
cd ios && pod install && cd ..
npm run ios
# Android
npm run android
```

> El emulador Android usa `http://10.0.2.2:5000`; iOS usa `localhost`.
> Para un dispositivo físico, edita `HOST` en `src/api/client.tsx` con la IP LAN de tu Mac.

## Autenticación (OTP por email)
1. Introduce tu correo → el backend envía un código.
2. En desarrollo (`MAIL_DRIVER=stub`) el código no se envía por email: se
   **loguea en la consola del backend** y la app lo muestra como pista `Dev: ######`.
3. Escribe el código → entras. El token JWT se guarda en `AsyncStorage`.

SSO (Apple/Google) está maquetado pero deshabilitado; se habilita más adelante.

## Estructura
```
src/
  theme.ts            tokens de color/tipografía (beige + rosa + azul)
  i18n.ts             textos de UI (es/en) + L() para campos { es, en }
  api/                client axios + servicios (auth, contenido)
  context/AuthContext.tsx
  navigation/         AppNavigator (stack) + MainTabs (tabs flotantes)
  components/         Sky, CloudCard, Button, Icon, Station, TabBar…
  screens/            Welcome, Onboarding, Auth, Dashboard, Home, Lesson,
                      Chat, Chats, Streak, Devocionales, Notifications
```

## Fuentes
La app referencia **Cormorant Garamond** (títulos) y **Manrope** (texto). No
vienen incluidas: mientras no se enlacen, RN usa la fuente del sistema. Ver
`assets/fonts/README.md` para añadirlas (pixel-perfect).

## Idioma (es/en)
Todo el contenido del backend es bilingüe (`{ es, en }`) y los textos de UI
viven en `src/i18n.ts`. El idioma sale de `user.locale` (por defecto `es`).
