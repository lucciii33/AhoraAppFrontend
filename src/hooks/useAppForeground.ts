import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';

// Ejecuta `onForeground` cada vez que la app vuelve a primer plano.
//
// Sin esto, un `useEffect([])` solo corre al montar: si la usuaria deja la app
// abierta o en segundo plano y vuelve al día siguiente, la pantalla no se
// remonta, no se llama a `daily/today` y el día nuevo nunca se marca en el
// tracker. Es justo el caso de quien abre la app cada mañana sin cerrarla.
export function useAppForeground(onForeground: () => void) {
  // Guardamos el callback en una ref para no re-suscribirnos en cada render.
  const cb = useRef(onForeground);
  cb.current = onForeground;

  useEffect(() => {
    let prev: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener('change', next => {
      if (/inactive|background/.test(prev) && next === 'active') cb.current();
      prev = next;
    });
    return () => sub.remove();
  }, []);
}
