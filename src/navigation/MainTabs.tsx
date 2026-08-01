import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TabBar, TabId} from '../components/TabBar';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import LessonScreen from '../screens/LessonScreen';
import ChatScreen from '../screens/ChatScreen';

// Contenedor de las 4 tabs con la barra flotante. Reemplaza el enrutado por
// estado del prototipo (`screen`/`tab`) por navegación nativa: las tabs viven
// aquí; el resto de pantallas se apilan por encima con el Stack.
// Destino opcional dentro de una tab: quien la abre puede pedir que se
// posicione en una estación concreta en vez de arriba del todo.
export type TabFocus = 'tarea' | undefined;

export default function MainTabs({navigation}: any) {
  const {locale} = useAuth();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [focus, setFocus] = useState<TabFocus>();
  const switchTab = (id: TabId, next?: TabFocus) => {
    setTab(id);
    setFocus(next);
  };

  return (
    <View style={styles.root}>
      {tab === 'dashboard' && (
        <DashboardScreen navigation={navigation} switchTab={switchTab} />
      )}
      {tab === 'home' && (
        <HomeScreen navigation={navigation} switchTab={switchTab} focus={focus} />
      )}
      {tab === 'lesson' && (
        <LessonScreen navigation={navigation} switchTab={switchTab} />
      )}
      {tab === 'chat' && (
        <ChatScreen navigation={navigation} switchTab={switchTab} />
      )}
      <TabBar active={tab} onTab={switchTab} locale={locale} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.cream},
});
