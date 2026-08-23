import client from './client';

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  birthDate?: string | null; // ISO; la app la muestra, no la recalcula
  age?: number | null; // la calcula el backend desde birthDate
  country?: string;
  locale: 'es' | 'en';
  onboarding?: {
    completed?: boolean;
    entregar?: string[];
    reminderTime?: string;
  };
  streak?: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
    totalPrayers: number;
    totalTasks: number;
  };
  token: string;
}

export interface RequestCodeResult {
  ok: boolean;
  email: string;
  isNew: boolean;
  message: string;
  devCode?: string; // solo en dev con MAIL_DRIVER=stub
}

function errorMessage(e: any) {
  return e?.response?.data?.message || e?.message || 'No se pudo conectar';
}

export const authService = {
  // Pide el código OTP al backend (crea el usuario si no existe).
  requestCode: async (payload: {
    email: string;
    firstName?: string;
    locale?: 'es' | 'en';
  }): Promise<RequestCodeResult> => {
    try {
      const res = await client.post('/auth/request-code', payload);
      return res.data;
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },

  // Verifica el código y devuelve el usuario + token.
  verifyCode: async (payload: {email: string; code: string}): Promise<AuthUser> => {
    try {
      const res = await client.post('/auth/verify-code', payload);
      return res.data;
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await client.get('/auth/me');
    return res.data;
  },

  updateMe: async (payload: {
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
    country?: string;
    locale?: 'es' | 'en';
    onboarding?: AuthUser['onboarding'];
  }): Promise<AuthUser> => {
    try {
      const res = await client.put('/auth/me', payload);
      return res.data;
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },
};
