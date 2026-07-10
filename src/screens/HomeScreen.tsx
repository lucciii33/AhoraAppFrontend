import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, TextInput, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {CloudCard, Station, LinkAction} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, fechaHoy, tr} from '../i18n';
import {dailyService} from '../api/contentService';
import {DailyEntry, Progress, StationKey} from '../api/types';

// Home — "El camino de hoy": recorrido vertical por las 5 estaciones del día.
export default function HomeScreen({navigation, switchTab}: any) {
  const insets = useSafeAreaInsets();
  const {user, locale} = useAuth();
  const T = tr(locale);

  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [taskText, setTaskText] = useState('');
  const [streakCount, setStreakCount] = useState(user?.streak?.current ?? 0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await dailyService.today();
        if (!alive) return;
        setEntry(data.entry);
        setProgress(data.progress);
        setTaskText(data.progress?.taskText || '');
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  const done = (k: StationKey) => !!progress?.stations?.[k];
  const hechas = progress ? Object.values(progress.stations).filter(Boolean).length : 0;
  const total = 5;

  const mark = async (station: StationKey, extra?: {taskText?: string}) => {
    // Optimista
    setProgress(p =>
      p ? {...p, stations: {...p.stations, [station]: true}, taskText: extra?.taskText ?? p.taskText} : p,
    );
    try {
      const res = await dailyService.updateStation({station, done: true, ...extra});
      setProgress(res.progress);
      setStreakCount(res.streak.current);
    } catch {}
  };

  const line = (val: any) => L(val, locale);

  return (
    <Sky variant="day" scroll contentStyle={{paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 150}}>
      {/* saludo + racha */}
      <View style={styles.greetRow}>
        <View style={{flex: 1}}>
          <Text style={styles.date}>{fechaHoy(locale)}</Text>
          <Text style={styles.h1}>
            {T.goodMorning},{'\n'}
            {user?.firstName || (locale === 'en' ? 'friend' : 'amiga')}.
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Streak')} style={styles.streakPill}>
          <Icon name="sun" size={16} color={colors.rose} />
          <Text style={styles.streakPillText}>{streakCount}</Text>
        </Pressable>
      </View>

      {/* progreso del día */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${(hechas / total) * 100}%`}]} />
        </View>
        <Text style={styles.progressLabel}>
          {hechas}/{total}
        </Text>
      </View>

      {/* estaciones */}
      <Station
        time={locale === 'en' ? 'Sunrise · Morning prayer' : 'Amanecer · Oración de la mañana'}
        icon="sun"
        accent={colors.rose}
        done={done('oracion')}
        title={locale === 'en' ? 'Walking by Your hand' : 'Camino de Tu mano'}>
        <Text style={styles.quote}>
          {entry ? line(entry.morningPrayer) : '“…”'}
        </Text>
        {!done('oracion') && (
          <LinkAction
            label={locale === 'en' ? 'Mark as prayed' : 'Marcar como orada'}
            icon="check"
            color={colors.roseInk}
            onPress={() => mark('oracion')}
          />
        )}
      </Station>

      <Station
        time={locale === 'en' ? 'Morning · Reflection of the day' : 'Mañana · Reflexión del día'}
        icon="book"
        accent={colors.skyDeep}
        done={done('reflexion')}
        title={locale === 'en' ? 'How we see the day' : 'Cómo miramos el día'}>
        <Text style={styles.body}>{entry ? line(entry.reflection.summary) : ''}</Text>
        <LinkAction
          label={locale === 'en' ? 'Read the reflection' : 'Leer la reflexión'}
          icon="arrowRight"
          color={colors.skyDeep}
          onPress={() => {
            mark('reflexion');
            switchTab('lesson');
          }}
        />
      </Station>

      <Station
        time={locale === 'en' ? 'Midday · Practice of the day' : 'Mediodía · Práctica del día'}
        icon="wind"
        accent={colors.rose}
        done={done('practica')}
        title={entry ? line(entry.practice.title) : locale === 'en' ? 'A minute of silence' : 'Un minuto de silencio'}>
        <Text style={styles.body}>{entry ? line(entry.practice.text) : ''}</Text>
        {entry && !!line(entry.practice.question) && (
          <Text style={[styles.quote, {marginTop: 8}]}>{line(entry.practice.question)}</Text>
        )}
        {!done('practica') && (
          <LinkAction
            label={locale === 'en' ? 'Done' : 'Hecho'}
            icon="check"
            color={colors.roseInk}
            onPress={() => mark('practica')}
          />
        )}
      </Station>

      <Station
        time={locale === 'en' ? 'Afternoon · Task of the day' : 'Tarde · Tarea del día'}
        icon="feather"
        accent={colors.skyDeep}
        done={done('tarea')}
        title={entry ? line(entry.task.title) : locale === 'en' ? 'A look at the past' : 'Una mirada al pasado'}>
        <Text style={[styles.body, {marginBottom: 12}]}>{entry ? line(entry.task.prompt) : ''}</Text>
        <TextInput
          value={taskText}
          onChangeText={setTaskText}
          placeholder={locale === 'en' ? 'Write here…' : 'Escribe aquí…'}
          placeholderTextColor={colors.sand}
          multiline
          style={styles.textarea}
        />
        {!done('tarea') && (
          <LinkAction
            label={locale === 'en' ? 'Save my reflection' : 'Guardar mi reflexión'}
            icon="check"
            color={colors.skyDeep}
            onPress={() => mark('tarea', {taskText})}
          />
        )}
      </Station>

      <Station
        time={locale === 'en' ? 'Night · Reminder of the day' : 'Noche · Recordatorio del día'}
        icon="moon"
        accent={colors.rose}
        done={done('recordatorio')}
        isLast
        title={entry ? line(entry.nightReminder.title) : locale === 'en' ? 'To rest in Him' : 'Para descansar en Él'}>
        <Text style={styles.quote}>{entry ? line(entry.nightReminder.text) : ''}</Text>
        {!done('recordatorio') && (
          <LinkAction
            label={locale === 'en' ? 'Keep in my heart' : 'Guardar en el corazón'}
            icon="heart"
            color={colors.roseInk}
            onPress={() => mark('recordatorio')}
          />
        )}
      </Station>

      {/* companion */}
      <Pressable onPress={() => switchTab('chat')} style={styles.companion}>
        <View style={styles.companionIcon}>
          <Icon name="chat" size={22} color="#fff" />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.companionTitle}>{T.talkToJesus}</Text>
          <Text style={styles.companionSub}>{T.talkHeart}</Text>
        </View>
        <Icon name="arrowRight" size={20} color="#fff" />
      </Pressable>
    </Sky>
  );
}

const styles = StyleSheet.create({
  greetRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 6},
  date: {fontFamily: font.body, fontSize: 13, fontWeight: '600', color: colors.earth},
  h1: {marginTop: 4, fontFamily: font.display, fontWeight: '500', fontSize: 38, lineHeight: 40, color: colors.inkSoft},
  streakPill: {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13, ...shadow.rest},
  streakPillText: {fontFamily: font.body, fontSize: 14, fontWeight: '700', color: colors.skyDeep},

  progressRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22},
  progressTrack: {flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden'},
  progressFill: {height: '100%', borderRadius: 999, backgroundColor: colors.skyDeep},
  progressLabel: {fontFamily: font.body, fontSize: 12.5, fontWeight: '700', color: colors.earth},

  quote: {fontFamily: font.display, fontStyle: 'italic', fontSize: 17.5, lineHeight: 26, color: colors.inkSoft},
  body: {fontFamily: font.body, fontSize: 15, lineHeight: 23, color: colors.earth},
  textarea: {
    minHeight: 76,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    fontFamily: font.body,
    fontSize: 14.5,
    color: colors.ink,
    textAlignVertical: 'top',
  },

  companion: {marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.skyDeep, borderRadius: 26, paddingVertical: 20, paddingHorizontal: 22, ...shadow.lift},
  companionIcon: {width: 46, height: 46, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center'},
  companionTitle: {fontFamily: font.display, fontSize: 20, fontWeight: '500', color: '#fff'},
  companionSub: {fontFamily: font.body, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginTop: 2},
});
