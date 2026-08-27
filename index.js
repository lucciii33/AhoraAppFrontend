/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Manejador de los avisos que llegan con la app cerrada o en segundo plano.
// Tiene que registrarse AQUÍ, fuera del componente: Firebase arranca un
// contexto de JS aparte, sin la app montada, y si no lo encuentra avisa por
// consola en cada mensaje.
//
// No pintamos nada: nuestros recordatorios llevan payload `notification`, así
// que el propio sistema ya los muestra. Duplicarlo aquí sacaría dos avisos.
setBackgroundMessageHandler(getMessaging(), async () => {});

AppRegistry.registerComponent(appName, () => App);
