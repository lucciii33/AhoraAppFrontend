import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors, font, shadow} from '../theme';
import {Icon, IconName} from './Icon';

export type TabId = 'dashboard' | 'home' | 'lesson' | 'chat';

// Alto total que la barra flotante ocupa desde el borde inferior de la
// pantalla (bottom: 18 + alto de la barra). Las pantallas con contenido fijo
// abajo lo usan para no quedar tapadas.
export const TAB_BAR_SPACE = 84;

const TABS: {id: TabId; icon: IconName; es: string; en: string}[] = [
  {id: 'dashboard', icon: 'home', es: 'Inicio', en: 'Home'},
  {id: 'home', icon: 'sun', es: 'Hoy', en: 'Today'},
  {id: 'lesson', icon: 'book', es: 'Devocional', en: 'Devotional'},
  {id: 'chat', icon: 'chat', es: 'Compañero', en: 'Companion'},
];

// Barra de navegación flotante inferior (translúcida).
export function TabBar({
  active,
  onTab,
  locale = 'es',
}: {
  active: TabId;
  onTab: (id: TabId) => void;
  locale?: 'es' | 'en';
}) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map(tab => {
          const on = active === tab.id;
          const color = on ? colors.skyDeep : colors.earth;
          return (
            <Pressable
              key={tab.id}
              testID={`tab-${tab.id}`}
              onPress={() => onTab(tab.id)}
              style={styles.item}>
              <Icon name={tab.icon} size={21} color={color} strokeWidth={on ? 1.9 : 1.5} />
              <Text style={[styles.label, {color, fontWeight: on ? '700' : '500'}]}>
                {locale === 'en' ? tab.en : tab.es}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute', left: 14, right: 14, bottom: 18},
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(247,251,254,0.92)',
    borderRadius: 28,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    ...shadow.lift,
  },
  item: {flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6},
  label: {fontFamily: font.body, fontSize: 10.5, letterSpacing: 0.1},
});
