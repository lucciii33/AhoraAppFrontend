import client from './client';
import {
  AppNotification,
  Conversation,
  ConversationSummary,
  DailyEntry,
  Devotional,
  Progress,
  StationKey,
  StreakInfo,
  WeekDay,
} from './types';

// ── Camino del día ──────────────────────────────────────────────
export const dailyService = {
  today: async (): Promise<{
    day: string;
    dayNumber: number;
    entry: DailyEntry | null;
    progress: Progress;
  }> => {
    const res = await client.get('/daily/today');
    return res.data;
  },
  updateStation: async (payload: {
    station?: StationKey;
    done?: boolean;
    taskText?: string;
  }): Promise<{progress: Progress; streak: StreakInfo}> => {
    const res = await client.put('/daily/today/station', payload);
    return res.data;
  },
  streak: async (): Promise<{streak: StreakInfo; week: WeekDay[]}> => {
    const res = await client.get('/daily/streak');
    return res.data;
  },
};

// ── Devocionales ────────────────────────────────────────────────
export const devotionalService = {
  list: async (
    page = 1,
    limit = 6,
  ): Promise<{items: Devotional[]; page: number; total: number; totalPages: number}> => {
    const res = await client.get('/devotionals', {params: {page, limit}});
    return res.data;
  },
  recent: async (limit = 4): Promise<Devotional[]> => {
    const res = await client.get('/devotionals/recent', {params: {limit}});
    return res.data;
  },
  get: async (id: string): Promise<Devotional> => {
    const res = await client.get(`/devotionals/${id}`);
    return res.data;
  },
};

// ── Conversaciones (Compañero) ──────────────────────────────────
export const conversationService = {
  list: async (limit = 20): Promise<ConversationSummary[]> => {
    const res = await client.get('/conversations', {params: {limit}});
    return res.data;
  },
  get: async (id: string): Promise<Conversation> => {
    const res = await client.get(`/conversations/${id}`);
    return res.data;
  },
  create: async (text?: string): Promise<Conversation> => {
    const res = await client.post('/conversations', text ? {text} : {});
    return res.data;
  },
  send: async (
    id: string,
    text: string,
  ): Promise<{conversationId: string; title: string; reply: {role: 'companion'; text: string}}> => {
    const res = await client.post(`/conversations/${id}/messages`, {text});
    return res.data;
  },
};

// ── Avisos ──────────────────────────────────────────────────────
export const notificationService = {
  list: async (): Promise<AppNotification[]> => {
    const res = await client.get('/notifications');
    return res.data;
  },
  markRead: async (id: string): Promise<AppNotification> => {
    const res = await client.put(`/notifications/${id}/read`);
    return res.data;
  },
};
