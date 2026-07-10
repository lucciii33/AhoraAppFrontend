import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {CloudCard, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, fechaHoy, tr} from '../i18n';
import {dailyService, devotionalService} from '../api/contentService';
import {DailyEntry, Devotional, StreakInfo, WeekDay} from '../api/types';

// Dashboard — "Inicio": panel del día.
export default function DashboardScreen({navigation, switchTab}: any) {
  const insets = useSafeAreaInsets();
  const {user, locale} = useAuth();
  const T = tr(locale);

  const [streak, setStreak] = useState<StreakInfo | null>(user?.streak || null);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [recent, setRecent] = useState<Devotional[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, today, rec] = await Promise.all([
          dailyService.streak(),
          dailyService.today(),
          devotionalService.recent(4),
        ]);
        if (!alive) return;
        setStreak(s.streak);
        setWeek(s.week);
        setEntry(today.entry);
        setRecent(rec);
      } catch {
        /* sin conexión: se muestran los valores por defecto */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const racha = streak?.current ?? 0;
  const reflDevId =
    entry && entry.reflection && typeof entry.reflection.devotional === 'object'
      ? (entry.reflection.devotional as Devotional)._id
      : undefined;

  const accesos = [
    {id: 'hoy', label: locale === 'en' ? 'Today' : 'Hoy', sub: T.todayPath, icon: 'sun' as const, bg: colors.skySoft, fg: colors.skyInk, go: () => switchTab('home')},
    {id: 'chat', label: T.companion, sub: locale === 'en' ? 'Talk with Him' : 'Habla con Él', icon: 'chat' as const, bg: colors.blush, fg: colors.roseInk, go: () => switchTab('chat')},
    {id: 'racha', label: T.myStreak, sub: `${racha} ${T.days}`, icon: 'flame' as const, bg: colors.skySoft, fg: colors.skyInk, go: () => navigation.navigate('Streak')},
  ];

  const openTask = () =>
    reflDevId ? navigation.navigate('Lesson', {devotionalId: reflDevId}) : switchTab('home');

  return (
    <Sky variant="day" scroll contentStyle={{paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 150}}>
      {/* saludo */}
      <View style={styles.greetRow}>
        <View style={{flex: 1}}>
          <Text style={styles.date}>{fechaHoy(locale)}</Text>
          <Text style={styles.h1}>
            {T.goodMorning},{'\n'}
            {user?.firstName || (locale === 'en' ? 'friend' : 'amiga')}.
          </Text>
        </View>
        <IconButton name="bell" onPress={() => navigation.navigate('Notifications')} />
      </View>

      {/* accesos rápidos */}
      <View style={styles.quickRow}>
        {accesos.map(a => (
          <Pressable key={a.id} onPress={a.go} style={[styles.quick, {backgroundColor: a.bg}]}>
            <View style={styles.quickIcon}>
              <Icon name={a.icon} size={19} color={a.fg} />
            </View>
            <View>
              <Text style={styles.quickLabel}>{a.label}</Text>
              <Text style={[styles.quickSub, {color: a.fg}]}>{a.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* racha con semana */}
      <CloudCard onPress={() => navigation.navigate('Streak')} style={{marginBottom: 14}}>
        <View style={styles.streakHead}>
          <View style={styles.flameBox}>
            <Icon name="flame" size={24} color="#fff" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.streakBig}>
              {racha} {locale === 'en' ? 'days of the path' : 'días de camino'}
            </Text>
            <Text style={styles.streakSub}>
              {locale === 'en' ? "You're on fire. Keep going!" : 'Vas encendida. ¡Sigue así!'}
            </Text>
          </View>
          <Icon name="arrowRight" size={20} color={colors.sand} />
        </View>
        <View style={styles.weekRow}>
          {(week.length ? week : placeholderWeek()).map((s, i) => (
            <View key={i} style={styles.weekCell}>
              <View
                style={[
                  styles.weekDot,
                  s.done
                    ? {backgroundColor: colors.skyDeep}
                    : s.today
                    ? {backgroundColor: '#fff', borderWidth: 2, borderColor: colors.rose}
                    : {backgroundColor: 'rgba(216,203,184,0.28)', borderWidth: 1, borderColor: colors.border},
                ]}>
                {s.done && <Icon name="check" size={14} color="#fff" />}
                {!s.done && s.today && <View style={styles.todayDot} />}
              </View>
              <Text style={[styles.weekLabel, {color: s.today ? colors.rose : colors.sand}]}>{s.d}</Text>
            </View>
          ))}
        </View>
      </CloudCard>

      {/* tarea del día */}
      <Pressable onPress={openTask} style={styles.task}>
        <View style={styles.taskHead}>
          <Icon name="feather" size={17} color={colors.rose} />
          <Text style={styles.taskKicker}>{T.taskOfDay.toUpperCase()}</Text>
        </View>
        <Text style={styles.taskText}>
          {entry ? L(entry.task.prompt, locale) : locale === 'en'
            ? 'Recall something you saw as a problem and write how, over time, it brought you a lesson.'
            : 'Recuerda algo que viviste como un problema y escribe cómo, con el tiempo, te trajo un aprendizaje.'}
        </Text>
        <View style={styles.taskCta}>
          <Text style={styles.taskCtaText}>{T.writeReflection}</Text>
          <Icon name="arrowRight" size={15} color="#fff" />
        </View>
      </Pressable>

      {/* recursos anteriores */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{T.resources.toUpperCase()}</Text>
        <Pressable onPress={() => navigation.navigate('Devocionales')}>
          <Text style={styles.sectionLink}>{T.seeAll}</Text>
        </Pressable>
      </View>
      <View style={{gap: 10}}>
        {recent.map(r => (
          <CloudCard
            key={r._id}
            onPress={() => navigation.navigate('Lesson', {devotionalId: r._id})}
            style={styles.resource}>
            <View style={styles.resourceIcon}>
              <Icon name="book" size={20} color={colors.earth} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.resourceMeta} numberOfLines={1}>
                {r.reference} · {typeLabel(r.type, locale)}
              </Text>
              <Text style={styles.resourceTitle} numberOfLines={1}>
                {L(r.quote, locale).replace(/[""]/g, '')}
              </Text>
            </View>
            <Icon name="arrowRight" size={18} color={colors.sand} />
          </CloudCard>
        ))}
      </View>
    </Sky>
  );
}

function typeLabel(type: string, locale: string) {
  const map: Record<string, [string, string]> = {
    reflexion: ['Reflexión', 'Reflection'],
    practica: ['Práctica', 'Practice'],
    tarea: ['Tarea', 'Task'],
  };
  const pair = map[type] || map.reflexion;
  return locale === 'en' ? pair[1] : pair[0];
}

function placeholderWeek(): WeekDay[] {
  return ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => ({d, day: '', done: i < 4, today: i === 4}));
}

const styles = StyleSheet.create({
  greetRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20},
  date: {fontFamily: font.body, fontSize: 13, fontWeight: '600', color: colors.earth},
  h1: {marginTop: 4, fontFamily: font.display, fontWeight: '500', fontSize: 36, lineHeight: 38, color: colors.inkSoft},

  quickRow: {flexDirection: 'row', gap: 10, marginBottom: 22},
  quick: {flex: 1, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 12, gap: 10, ...shadow.rest},
  quickIcon: {width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  quickLabel: {fontFamily: font.body, fontSize: 14.5, fontWeight: '700', color: colors.ink},
  quickSub: {fontFamily: font.body, fontSize: 11.5, fontWeight: '600', marginTop: 2},

  streakHead: {flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16},
  flameBox: {width: 52, height: 52, borderRadius: 16, backgroundColor: colors.skyDeep, alignItems: 'center', justifyContent: 'center', ...shadow.rest},
  streakBig: {fontFamily: font.display, fontSize: 26, fontWeight: '500', color: colors.ink},
  streakSub: {fontFamily: font.body, fontSize: 13, color: colors.earth, marginTop: 3},
  weekRow: {flexDirection: 'row', justifyContent: 'space-between'},
  weekCell: {alignItems: 'center', gap: 7, flex: 1},
  weekDot: {width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center'},
  todayDot: {width: 7, height: 7, borderRadius: 999, backgroundColor: colors.rose},
  weekLabel: {fontFamily: font.body, fontSize: 11, fontWeight: '700'},

  task: {backgroundColor: colors.blush, borderRadius: 24, padding: 20, marginBottom: 26, ...shadow.rest},
  taskHead: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9},
  taskKicker: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.roseInk},
  taskText: {fontFamily: font.display, fontStyle: 'italic', fontSize: 18.5, lineHeight: 26, color: colors.inkSoft},
  taskCta: {marginTop: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.rose, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16},
  taskCtaText: {fontFamily: font.body, fontSize: 13.5, fontWeight: '700', color: '#fff'},

  sectionHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 4, marginBottom: 12},
  sectionTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, color: colors.earth},
  sectionLink: {fontFamily: font.body, fontSize: 12.5, fontWeight: '700', color: colors.skyInk},
  resource: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14},
  resourceIcon: {width: 46, height: 46, borderRadius: 14, backgroundColor: colors.beige, alignItems: 'center', justifyContent: 'center'},
  resourceMeta: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: colors.skyInk, marginBottom: 2},
  resourceTitle: {fontFamily: font.body, fontSize: 15, fontWeight: '600', color: colors.ink},
});
