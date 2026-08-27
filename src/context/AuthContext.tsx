import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {authService, AuthUser, RequestCodeResult} from '../api/authService';
import {setAuthToken} from '../api/client';
import {Locale} from '../i18n';
import {
  registrarDispositivo,
  darDeBajaDispositivo,
  escucharPush,
} from '../services/push';

const TOKEN_KEY = 'ahora.auth.token';
const USER_KEY = 'ahora.auth.user';
const ONBOARDING_KEY = 'ahora.onboarding.seen';
const LOCALE_KEY = 'ahora.locale';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  onboardingSeen: boolean;
  locale: Locale;
  requestCode: (payload: {
    email: string;
    firstName?: string;
    locale?: Locale;
  }) => Promise<RequestCodeResult>;
  verifyCode: (payload: {email: string; code: string}) => Promise<void>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    birthDate?: string | null;
    country?: string;
    locale?: Locale;
    onboarding?: AuthUser['onboarding'];
  }) => Promise<void>;
  setUser: (u: AuthUser) => void;
  setLocale: (l: Locale) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  // Idioma elegido en el onboarding, antes de que exista el usuario. Una vez
  // hay cuenta manda `user.locale` (que el onboarding guarda al registrarse).
  const [pickedLocale, setPickedLocale] = useState<Locale>('es');

  useEffect(() => {
    async function restore() {
      try {
        const [storedToken, storedUser, seen, savedLocale] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(LOCALE_KEY),
        ]);
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setUserState(JSON.parse(storedUser));
        }
        setOnboardingSeen(seen === 'true');
        if (savedLocale === 'es' || savedLocale === 'en') {
          setPickedLocale(savedLocale);
        }
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const persistAuth = useCallback(async (nextUser: AuthUser) => {
    setAuthToken(nextUser.token);
    setUserState(nextUser);
    setToken(nextUser.token);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, nextUser.token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser)),
    ]);
  }, []);

  const requestCode = useCallback(
    (payload: {email: string; firstName?: string; locale?: Locale}) =>
      authService.requestCode(payload),
    [],
  );

  const verifyCode = useCallback(
    async (payload: {email: string; code: string}) => {
      const nextUser = await authService.verifyCode(payload);
      await persistAuth(nextUser);
    },
    [persistAuth],
  );

  const setUser = useCallback(
    (u: AuthUser) => {
      setUserState(u);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    },
    [],
  );

  const updateProfile = useCallback(
    async (payload: {
      firstName?: string;
      lastName?: string;
      birthDate?: string | null;
      country?: string;
      locale?: Locale;
      onboarding?: AuthUser['onboarding'];
    }) => {
      const updated = await authService.updateMe(payload);
      // updateMe no devuelve token; conservamos el actual.
      setUserState(prev => {
        const merged = {...(prev || {}), ...updated, token: prev?.token || token || ''} as AuthUser;
        AsyncStorage.setItem(USER_KEY, JSON.stringify(merged));
        return merged;
      });
    },
    [token],
  );

  // Cambia el idioma. Antes de tener cuenta solo se guarda en el dispositivo;
  // con sesión abierta se persiste también en el perfil.
  const setLocale = useCallback(
    async (l: Locale) => {
      setPickedLocale(l);
      await AsyncStorage.setItem(LOCALE_KEY, l);
      if (token) {
        try {
          await updateProfile({locale: l});
        } catch {}
      }
    },
    [token, updateProfile],
  );

  const logout = useCallback(async () => {
    // Primero la baja del teléfono, que necesita el token para autenticarse.
    // Si se hiciera después, la petición saldría sin cabecera y este aparato
    // seguiría recibiendo los recordatorios de quien acaba de salir.
    await darDeBajaDispositivo();

    setAuthToken(null);
    setUserState(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  }, []);

  // Push: con la sesión abierta, registramos el teléfono y escuchamos.
  //
  // Aquí NO se pide permiso (`pedir` va en false): si ya está concedido se
  // refresca el token y la zona horaria — que cambian solos, el primero
  // porque FCM lo rota y la segunda porque la persona viaja —, y si no, se
  // deja en paz. El permiso se pide en el onboarding, que es donde la persona
  // acaba de elegir su hora y el diálogo tiene sentido.
  const localeActivo = (user?.locale as Locale) || pickedLocale;
  useEffect(() => {
    if (!token) return;
    registrarDispositivo(localeActivo);
    return escucharPush(localeActivo);
  }, [token, localeActivo]);

  const completeOnboarding = useCallback(async () => {
    setOnboardingSeen(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      onboardingSeen,
      locale: localeActivo,
      requestCode,
      verifyCode,
      updateProfile,
      setUser,
      setLocale,
      logout,
      completeOnboarding,
    }),
    [user, token, loading, onboardingSeen, localeActivo, requestCode, verifyCode, updateProfile, setUser, setLocale, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
