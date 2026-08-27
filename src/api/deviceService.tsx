import client from './client';

// Registro del teléfono en el backend para las notificaciones push.
// El backend guarda el token de FCM y la zona horaria, y a partir de ahí manda
// el recordatorio a la hora elegida en el onboarding.

export interface ReminderStatus {
  reminderTime: string | null; // "06:30"
  reminderEnabled: boolean;
  timezone: string | null;
  devices: number;
  lastReminderOn: string | null;
  lastReminderAt: string | null;
  pending: boolean;
}

function errorMessage(e: any) {
  return e?.response?.data?.message || e?.message || 'No se pudo conectar';
}

export const deviceService = {
  // Alta o refresco. Se llama en cada arranque con sesión: el token de FCM
  // caduca y rota, y la zona cambia si la persona viaja.
  register: async (payload: {
    token: string;
    platform: 'ios' | 'android';
    timezone: string;
    locale: 'es' | 'en';
  }) => {
    try {
      const res = await client.post('/devices', payload);
      return res.data;
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },

  // Baja al cerrar sesión, para que a este teléfono no le sigan llegando los
  // recordatorios de quien ya no lo usa.
  unregister: async (token: string) => {
    try {
      await client.delete('/devices', {data: {token}});
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },

  status: async (): Promise<ReminderStatus> => {
    const res = await client.get('/devices/reminder');
    return res.data;
  },

  // Push de prueba a uno mismo: comprueba la cadena entera sin esperar a la
  // hora del recordatorio.
  test: async () => {
    try {
      const res = await client.post('/devices/test');
      return res.data;
    } catch (e) {
      throw new Error(errorMessage(e));
    }
  },
};
