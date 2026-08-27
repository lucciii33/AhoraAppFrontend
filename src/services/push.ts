import {Platform} from 'react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  getInitialNotification,
  registerDeviceForRemoteMessages,
  isDeviceRegisteredForRemoteMessages,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, AuthorizationStatus} from '@notifee/react-native';
import {deviceService} from '../api/deviceService';
import {Locale} from '../i18n';

// Notificaciones push del teléfono.
//
// Quién hace qué:
//   - Firebase (messaging) da el TOKEN del aparato y recibe los avisos.
//   - Notifee pide el permiso, crea el canal de Android y pinta el aviso
//     cuando llega con la app abierta (ahí ni iOS ni Android muestran nada
//     por su cuenta).
//   - El backend decide CUÁNDO: guarda el token y la hora del onboarding, y
//     un barrido manda el push a la hora local de cada persona.
//
// La app no agenda nada por su cuenta: si la hora cambia, cambia en el perfil
// y el siguiente recordatorio ya sale a la nueva.
//
// La API de @react-native-firebase v26 es modular: `getMessaging()` primero y
// las funciones sueltas después, en vez del viejo `messaging().loQueSea()`.

// Tiene que coincidir con el `channelId` que manda el backend en services/push.js.
const CANAL_ID = 'ahora-recordatorios';

const CANAL = {
  es: {name: 'Recordatorios', description: 'Tu momento diario con Dios'},
  en: {name: 'Reminders', description: 'Your daily time with God'},
};

const plataforma = (): 'ios' | 'android' => (Platform.OS === 'ios' ? 'ios' : 'android');

// La zona horaria del aparato, en formato IANA ("America/Mexico_City").
// Es lo que permite que el recordatorio suene a las 6:30 de SU mañana.
export function zonaHoraria(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

// El canal de Android. Sin él, en Android 8+ la notificación no se muestra.
// Es idempotente: crearlo de nuevo solo actualiza el nombre.
export async function crearCanal(locale: Locale = 'es') {
  if (Platform.OS !== 'android') return;
  const txt = CANAL[locale] || CANAL.es;
  await notifee.createChannel({
    id: CANAL_ID,
    name: txt.name,
    description: txt.description,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

// Pide permiso de notificaciones. Devuelve true si quedó concedido.
// Vale para las dos plataformas: en iOS abre el diálogo del sistema, en
// Android 13+ pide POST_NOTIFICATIONS (y en versiones viejas ya viene dado).
export async function pedirPermiso(): Promise<boolean> {
  try {
    const ajustes = await notifee.requestPermission();
    return (
      ajustes.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      ajustes.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

// ¿Ya nos dieron permiso? Sin abrir ningún diálogo.
export async function tienePermiso(): Promise<boolean> {
  try {
    const ajustes = await notifee.getNotificationSettings();
    return (
      ajustes.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      ajustes.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

// ¿Nunca se le ha preguntado a esta persona?
//
// Distingue el "todavía no" del "ya dijo que no", que es una diferencia que
// importa: a quien lo negó no hay que volver a molestarlo, pero a quien nunca
// vio el diálogo hay que enseñárselo. Es el caso de quien ya tenía la app
// instalada antes de que existieran los recordatorios: pasó por el onboarding
// cuando ese paso no estaba, y sin esto se quedaría sin avisos para siempre
// sin enterarse.
async function nuncaSePreguntó(): Promise<boolean> {
  try {
    const ajustes = await notifee.getNotificationSettings();
    return ajustes.authorizationStatus === AuthorizationStatus.NOT_DETERMINED;
  } catch {
    return false;
  }
}

// El token de FCM de este aparato.
async function obtenerToken(): Promise<string | null> {
  try {
    const messaging = getMessaging();
    // En iOS hay que estar dado de alta en APNs antes de pedir el token. Con
    // el registro automático ya suele estarlo, pero asegurarlo evita un fallo
    // intermitente en el primer arranque tras instalar.
    if (Platform.OS === 'ios' && !isDeviceRegisteredForRemoteMessages(messaging)) {
      await registerDeviceForRemoteMessages(messaging);
    }
    return await getToken(messaging);
  } catch (e) {
    console.warn('[push] no se pudo obtener el token', e);
    return null;
  }
}

// Manda el token al backend. Se usa en el alta y cada vez que FCM lo rota.
async function sincronizarConBackend(token: string, locale: Locale) {
  await deviceService.register({
    token,
    platform: plataforma(),
    timezone: zonaHoraria(),
    locale,
  });
}

// Alta completa del aparato: permiso → canal → token → backend.
//
// `pedir` a false solo registra si el permiso YA estaba dado: sirve para el
// arranque de la app, donde no queremos soltarle un diálogo del sistema a
// quien acaba de abrirla. El onboarding sí lo pide, que es donde tiene
// sentido: la persona acaba de elegir su hora.
export async function registrarDispositivo(
  locale: Locale = 'es',
  {pedir = false}: {pedir?: boolean} = {},
): Promise<{ok: boolean; motivo?: string; token?: string}> {
  // Tres casos, y solo uno abre el diálogo por su cuenta:
  //   ya concedido      -> seguimos, sin molestar
  //   nunca preguntado  -> lo preguntamos (usuarios de antes del onboarding
  //                        con recordatorios; si no, nunca lo verían)
  //   ya lo negó        -> se respeta, no se insiste en cada arranque
  let concedido = await tienePermiso();
  if (!concedido && (pedir || (await nuncaSePreguntó()))) {
    concedido = await pedirPermiso();
  }
  if (!concedido) return {ok: false, motivo: 'sin-permiso'};

  await crearCanal(locale);

  const token = await obtenerToken();
  if (!token) return {ok: false, motivo: 'sin-token'};

  try {
    await sincronizarConBackend(token, locale);
    return {ok: true, token};
  } catch (e: any) {
    // Que falle el registro no debe romper el arranque: la persona sigue
    // usando la app y el próximo intento lo arregla.
    console.warn('[push] el backend rechazó el registro', e?.message);
    return {ok: false, motivo: 'backend'};
  }
}

// Baja del aparato al cerrar sesión.
export async function darDeBajaDispositivo() {
  try {
    const token = await getToken(getMessaging());
    if (token) await deviceService.unregister(token);
  } catch {
    // Sin red o sin token: el backend lo limpiará solo cuando FCM le diga que
    // el token ya no vale.
  }
}

// Listeners que viven mientras la app está abierta. Devuelve la función para
// desengancharlos.
export function escucharPush(
  locale: Locale = 'es',
  onAbrir?: (data: Record<string, string>) => void,
): () => void {
  const messaging = getMessaging();

  // Con la app en primer plano ni iOS ni Android pintan nada: lo hacemos aquí.
  const offMensaje = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
    const {title, body} = remoteMessage.notification || {};
    if (!title && !body) return;
    await crearCanal(locale);
    await notifee.displayNotification({
      title: title || 'AHORA',
      body: body || '',
      data: (remoteMessage.data as Record<string, string>) || {},
      android: {channelId: CANAL_ID, smallIcon: 'ic_launcher', pressAction: {id: 'default'}},
      ios: {sound: 'default'},
    });
  });

  // FCM rota el token por su cuenta. Si no lo reenviamos, el backend se queda
  // con uno muerto y los recordatorios dejan de llegar, en silencio.
  const offToken = onTokenRefresh(messaging, async (token: string) => {
    try {
      await sincronizarConBackend(token, locale);
    } catch {}
  });

  // Tocar la notificación con la app en segundo plano.
  const offAbrir = onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
    onAbrir?.((remoteMessage?.data as Record<string, string>) || {});
  });

  return () => {
    offMensaje();
    offToken();
    offAbrir();
  };
}

// La notificación que ARRANCÓ la app (estaba cerrada del todo).
export async function avisoDeArranque(): Promise<Record<string, string> | null> {
  const inicial = await getInitialNotification(getMessaging());
  return (inicial?.data as Record<string, string>) || null;
}
