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
export default function MainTabs({navigation}: any) {
  const {locale} = useAuth();
  const [tab, setTab] = useState<TabId>('dashboard');
  const switchTab = (id: TabId) => setTab(id);

  return (
    <View style={styles.root}>
      {tab === 'dashboard' && (
        <DashboardScreen navigation={navigation} switchTab={switchTab} />
      )}
      {tab === 'home' && (
        <HomeScreen navigation={navigation} switchTab={switchTab} />
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
