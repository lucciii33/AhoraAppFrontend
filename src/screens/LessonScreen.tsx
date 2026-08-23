import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {Button, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, fechaHoy, tr} from '../i18n';
import {dailyService, devotionalService} from '../api/contentService';
import {Devotional} from '../api/types';

// Lección / Devocional del día — lectura larga + práctica + CTA al Compañero.
// Se usa como tab (carga el devocional de hoy) o apilada con {devotionalId}.
export default function LessonScreen({navigation, route, switchTab}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const T = tr(locale);
  const devotionalId: string | undefined = route?.params?.devotionalId;

  const [dev, setDev] = useState<Devotional | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let d: Devotional | null = null;
        if (devotionalId) {
          d = await devotionalService.get(devotionalId);
        } else {
          const today = await dailyService.today();
          const ref = today.entry?.reflection?.devotional;
          if (ref && typeof ref === 'object') d = ref as Devotional;
          if (!d) {
            const recent = await devotionalService.recent(1);
            d = recent[0] || null;
          }
        }
        if (alive) setDev(d);
      } catch {
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [devotionalId]);

  const goBack = () => (switchTab ? switchTab('home') : navigation.goBack());
  const goChat = () => (switchTab ? switchTab('chat') : navigation.navigate('Conversation', {}));

  return (
    <Sky testID="screen-lesson" variant="reading" scroll clouds={false} contentStyle={{paddingBottom: 150}}>
      {/* barra superior */}
      <View style={[styles.topbar, {paddingTop: insets.top + 8}]}>
        <IconButton testID="lesson-back" name="arrowLeft" onPress={goBack} />
        <Text style={styles.topTitle}>{T.reflectionOfDay.toUpperCase()}</Text>
        <IconButton
          testID="lesson-bookmark"
          name="bookmark"
          color={saved ? colors.skyDeep : colors.earth}
          onPress={() => setSaved(s => !s)}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.skyDeep} style={{marginTop: 60}} />
      ) : !dev ? (
        <Text testID="lesson-empty" style={styles.empty}>{locale === 'en' ? 'No devotional available.' : 'No hay devocional disponible.'}</Text>
      ) : (
        <View style={styles.content}>
          <Text style={styles.meta}>
            {fechaHoy(locale)}  ·  {dev.readingMinutes} {T.minRead}
          </Text>

          <Text testID="lesson-title" style={styles.title}>{L(dev.quote, locale)}</Text>

          {/* imagen placeholder o real */}
          <View style={styles.image}>
            <Text style={styles.imageLabel}>
              {locale === 'en' ? 'photo · sky / nature' : 'foto · cielo / naturaleza'}
            </Text>
          </View>

          {dev.body.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {L(p, locale)}
            </Text>
          ))}

          {!!L(dev.closingPrayer, locale) && (
            <Text style={styles.closing}>{L(dev.closingPrayer, locale)}</Text>
          )}

          {/* práctica */}
          <View style={styles.practice}>
            <View style={styles.practiceHead}>
              <Icon name="wind" size={18} color={colors.leaf} />
              <Text style={styles.practiceKicker}>{L(dev.practice.title, locale).toUpperCase()}</Text>
            </View>
            <Text style={styles.practiceText}>{L(dev.practice.text, locale)}</Text>
          </View>

          <View style={{marginTop: 22}}>
            <Button
              testID="lesson-go-chat"
              variant="primary"
              fullWidth
              onPress={goChat}
              icon={<Icon name="chat" size={18} color="#fff" />}>
              {locale === 'en' ? 'Talk with Jesus about this' : 'Habla con Jesús sobre esto'}
            </Button>
          </View>
        </View>
      )}
    </Sky>
  );
}

const styles = StyleSheet.create({
  topbar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10},
  topTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.earth},
  empty: {textAlign: 'center', marginTop: 60, fontFamily: font.body, color: colors.earth},
  content: {paddingHorizontal: 26, paddingTop: 6},
  meta: {flexDirection: 'row', fontFamily: font.body, fontSize: 13, color: colors.earth, marginBottom: 18},
  title: {fontFamily: font.display, fontWeight: '500', fontSize: 34, lineHeight: 41, color: colors.inkSoft},
  image: {
    marginVertical: 26,
    height: 168,
    borderRadius: 22,
    backgroundColor: colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  imageLabel: {fontFamily: font.body, fontSize: 12, letterSpacing: 0.4, color: colors.earth},
  paragraph: {fontFamily: font.body, fontSize: 17, lineHeight: 29, color: colors.ink, marginBottom: 18},
  closing: {fontFamily: font.display, fontStyle: 'italic', fontSize: 21, lineHeight: 30, color: colors.skyDeep, marginTop: -2, marginBottom: 4},
  practice: {marginTop: 30, backgroundColor: 'rgba(224,176,166,0.22)', borderWidth: 1, borderColor: 'rgba(192,122,112,0.28)', borderRadius: 22, padding: 22},
  practiceHead: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
  practiceKicker: {fontFamily: font.body, fontSize: 11.5, fontWeight: '700', letterSpacing: 1.2, color: colors.leaf},
  practiceText: {fontFamily: font.body, fontSize: 15.5, lineHeight: 25, color: colors.inkSoft},
});
