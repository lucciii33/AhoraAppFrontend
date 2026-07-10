// Utilidades de idioma. El contenido del backend llega como { es, en };
// `L` elige el idioma activo. Los textos fijos de UI viven en `t`.

export type Locale = 'es' | 'en';
export type Localized = { es?: string; en?: string } | string | null | undefined;

// Extrae el texto localizado de un campo { es, en } (o de un string plano).
export function L(field: Localized, locale: Locale = 'es'): string {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[locale] || field.es || field.en || '';
}

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function fechaHoy(locale: Locale = 'es', d = new Date()): string {
  if (locale === 'en') {
    return `${DAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}`;
  }
  return `${DIAS_ES[d.getDay()]}, ${d.getDate()} de ${MESES_ES[d.getMonth()]}`;
}

// Textos fijos de la interfaz.
export const t = {
  es: {
    goodMorning: 'Buenos días',
    continue: 'Continuar',
    todayPath: 'Tu camino',
    companion: 'Compañero',
    myStreak: 'Mi racha',
    days: 'días',
    seeAll: 'Ver todo',
    seeAllM: 'Ver todos',
    resources: 'Recursos anteriores',
    taskOfDay: 'Tarea del día',
    writeReflection: 'Escribir mi reflexión',
    talkToJesus: 'Habla con Jesús',
    talkHeart: 'Cuéntale lo que llevas hoy en el corazón.',
    newConversation: 'Nueva conversación',
    conversations: 'Conversaciones',
    yourChats: 'Tus charlas\ncon Jesús.',
    search: 'Buscar en tus conversaciones…',
    writeHere: 'Escribe lo que sientes…',
    reflectionOfDay: 'Reflexión del día',
    minRead: 'min de lectura',
    yourPath: 'Tu camino',
    prayers: 'oraciones',
    tasksWritten: 'tareas escritas',
    prevDevotionals: 'Devocionales anteriores',
    devotionals: 'Devocionales',
    pages: 'páginas',
    notices: 'Avisos',
    voiceOf: 'La voz de AHORA',
    email: 'Correo',
    code: 'Código',
    sendCode: 'Enviarme un código',
    verify: 'Entrar',
    enterCode: 'Escribe el código que te enviamos',
    resend: 'Reenviar código',
  },
  en: {
    goodMorning: 'Good morning',
    continue: 'Continue',
    todayPath: 'Your path',
    companion: 'Companion',
    myStreak: 'My streak',
    days: 'days',
    seeAll: 'See all',
    seeAllM: 'See all',
    resources: 'Earlier resources',
    taskOfDay: 'Task of the day',
    writeReflection: 'Write my reflection',
    talkToJesus: 'Talk with Jesus',
    talkHeart: 'Tell Him what you carry in your heart today.',
    newConversation: 'New conversation',
    conversations: 'Conversations',
    yourChats: 'Your talks\nwith Jesus.',
    search: 'Search your conversations…',
    writeHere: 'Write what you feel…',
    reflectionOfDay: 'Reflection of the day',
    minRead: 'min read',
    yourPath: 'Your path',
    prayers: 'prayers',
    tasksWritten: 'tasks written',
    prevDevotionals: 'Earlier devotionals',
    devotionals: 'Devotionals',
    pages: 'pages',
    notices: 'Notices',
    voiceOf: 'The voice of AHORA',
    email: 'Email',
    code: 'Code',
    sendCode: 'Send me a code',
    verify: 'Enter',
    enterCode: 'Enter the code we sent you',
    resend: 'Resend code',
  },
};

export type UIText = typeof t.es;
export const tr = (locale: Locale): UIText => t[locale] || t.es;
