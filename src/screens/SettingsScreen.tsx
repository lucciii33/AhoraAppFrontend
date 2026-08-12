import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {AppHeader, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {Locale} from '../i18n';

// Ajustes. Vive detrás del icono de la rueda del Dashboard (antes había una
// campana que abría los avisos in-app; ver DashboardScreen).
const LANGUAGES: {key: Locale; label: string}[] = [
  {key: 'es', label: 'Español'},
  {key: 'en', label: 'English'},
];

export default function SettingsScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale, setLocale} = useAuth();
  const en = locale === 'en';

  return (
    <Sky
      variant="day"
      scroll
      contentStyle={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 22,
        paddingBottom: insets.bottom + 60,
      }}>
      <AppHeader
        left={<IconButton name="arrowLeft" onPress={() => navigation.goBack()} />}
        title={en ? 'SETTINGS' : 'AJUSTES'}
      />

      <Text style={styles.h1}>{en ? 'Language' : 'Idioma'}</Text>
      <Text style={styles.p}>
        {en
          ? 'Your path and your Companion will speak in the language you choose.'
          : 'Tu camino y tu Compañero te hablarán en el idioma que elijas.'}
      </Text>

      <View style={styles.card}>
        {LANGUAGES.map((l, i) => {
          const on = locale === l.key;
          return (
            <Pressable
              key={l.key}
              onPress={() => setLocale(l.key)}
              style={({pressed}) => [
                styles.row,
                i > 0 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}>
              <Text
                style={[
                  styles.rowLabel,
                  {color: on ? colors.skyDeep : colors.inkSoft},
                ]}>
                {l.label}
              </Text>
              {on && <Icon name="check" size={19} color={colors.skyDeep} />}
            </Pressable>
          );
        })}
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: font.display,
    fontWeight: '500',
    fontSize: 30,
    color: colors.inkSoft,
  },
  p: {
    marginTop: 10,
    marginBottom: 26,
    fontFamily: font.body,
    fontSize: 15.5,
    lineHeight: 23,
    color: colors.earth,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    overflow: 'hidden',
    ...shadow.rest,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 19,
    paddingHorizontal: 20,
  },
  rowPressed: {backgroundColor: 'rgba(255,255,255,0.5)'},
  rowBorder: {borderTopWidth: 1, borderTopColor: colors.border},
  rowLabel: {fontFamily: font.body, fontSize: 17},
});
