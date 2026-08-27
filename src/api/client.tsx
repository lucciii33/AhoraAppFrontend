import axios from 'axios';
import {Platform} from 'react-native';

// Puerto del backend — debe coincidir con PORT en ahora-backend/.env
const PORT = 8000;

// IP de la máquina que corre el backend, en el wifi de casa.
//
// Hace falta para probar en un TELÉFONO DE VERDAD: ahí "localhost" es el
// propio teléfono, no tu Mac, así que la app se queda colgada sin poder ni
// iniciar sesión. En el simulador daría igual, porque comparte máquina.
//
// Si cambias de red (o el router te da otra IP), sácala de nuevo con:
//   ipconfig getifaddr en0
// Déjalo en '' para volver a simulador / emulador.
const LAN_IP = '192.168.1.174';

// Android emulador: 10.0.2.2 es su atajo al "localhost" de la máquina anfitriona.
const HOST = LAN_IP
  ? `http://${LAN_IP}:${PORT}`
  : Platform.OS === 'android'
  ? `http://10.0.2.2:${PORT}`
  : `http://localhost:${PORT}`;

const client = axios.create({
  baseURL: `${HOST}/api`,
  headers: {'Content-Type': 'application/json'},
  timeout: 60000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export default client;
