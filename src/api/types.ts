// Tipos que reflejan los modelos del backend. Los textos localizados llegan
// como { es, en }; usa `L()` de i18n para mostrarlos.

export type LText = {es?: string; en?: string};

export interface Devotional {
  _id: string;
  dayNumber: number;
  quote: LText;
  reference: LText;
  readingMinutes: number;
  imageUrl?: string;
  body: LText[];
  closingPrayer: LText;
  practice: {title: LText; text: LText};
  type: 'reflexion' | 'practica' | 'tarea';
  tint: 'rose' | 'sky';
}

export interface DailyEntry {
  _id: string;
  dayNumber: number; // día del camino (1, 2, 3…), no una fecha
  morningPrayer: LText;
  reflection: {devotional?: Devotional | string; summary: LText};
  practice: {title: LText; text: LText; question: LText};
  task: {title: LText; prompt: LText};
  nightReminder: {title: LText; text: LText};
}

export type StationKey =
  | 'oracion'
  | 'reflexion'
  | 'practica'
  | 'tarea'
  | 'recordatorio';

export interface Progress {
  _id: string;
  day: string; // fecha de calendario YYYY-MM-DD (racha)
  dayNumber: number; // día del camino que le tocó esa fecha (contenido)
  stations: Record<StationKey, boolean>;
  visited: boolean; // abrió la app ese día
  taskText: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  totalPrayers: number;
  totalTasks: number;
}

export interface WeekDay {
  d: string;
  day: string;
  done: boolean;
  today: boolean;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  preview: string;
  lastMessageAt: string;
}

export interface ChatMessage {
  role: 'user' | 'companion';
  text: string;
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageAt: string;
}

export interface AppNotification {
  _id: string;
  icon: string;
  tint: 'gold' | 'sky' | 'rose' | 'earth' | 'leaf';
  title: LText;
  body: LText;
  read: boolean;
  createdAt: string;
}
