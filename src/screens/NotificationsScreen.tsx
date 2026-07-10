import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {IconButton} from '../components/ui';
import {Icon, IconName} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, tr} from '../i18n';
import {notificationService} from '../api/contentService';
import {AppNotification} from '../api/types';

const TINTS: Record<string, string> = {
  gold: colors.gold,
  sky: colors.sky,
  rose: colors.rose,
  earth: colors.earth,
  leaf: colors.leaf,
};

// Notificaciones — "La voz de AHORA".
export default function NotificationsScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const T = tr(locale);

  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    let alive = true;
    notificationService
      .list()
      .then(list => alive && setItems(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const when = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(locale === 'en' ? 'en-US' : 'es-ES', {hour: '2-digit', minute: '2-digit'});
    }
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {day: 'numeric', month: 'short'});
  };

  return (
    <Sky variant="day" scroll contentStyle={{paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 60}}>
      <View style={styles.header}>
        <IconButton name="arrowLeft" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{T.notices.toUpperCase()}</Text>
        <View style={{width: 40}} />
      </View>

      <Text style={styles.h1}>{T.voiceOf}</Text>

      <View style={{gap: 12}}>
        {items.map(n => {
          const tint = TINTS[n.tint] || colors.sky;
          return (
            <View key={n._id} style={styles.card}>
              <View style={[styles.icon, {backgroundColor: tint + '22'}]}>
                <Icon name={n.icon as IconName} size={19} color={tint} />
              </View>
              <View style={{flex: 1}}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={2}>{L(n.title, locale)}</Text>
                  <Text style={styles.when}>{when(n.createdAt)}</Text>
                </View>
                <Text style={styles.body}>{L(n.body, locale)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22},
  headerTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.earth},
  h1: {fontFamily: font.display, fontWeight: '500', fontSize: 32, color: colors.inkSoft, marginBottom: 22},
  card: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    ...shadow.rest,
  },
  icon: {width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  title: {flex: 1, fontFamily: font.body, fontSize: 15, fontWeight: '700', color: colors.ink, lineHeight: 20},
  when: {fontFamily: font.body, fontSize: 11.5, color: colors.sand},
  body: {marginTop: 4, fontFamily: font.body, fontSize: 13.5, lineHeight: 20, color: colors.earth},
});
