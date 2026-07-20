import axios from 'axios';
import {Platform} from 'react-native';

// Puerto del backend — debe coincidir con PORT en ahora-backend/.env
const PORT = 8000;

// iOS sim: localhost works. Android emulator: 10.0.2.2 maps to host.
// Real device: cambia esto a la IP LAN de tu máquina (ej: http://192.168.1.42:8000)
const HOST =
  Platform.OS === 'android' ? `http://10.0.2.2:${PORT}` : `http://localhost:${PORT}`;

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
