import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle} from 'react-native-svg';
import {Sky} from '../components/Sky';
import {CloudCard, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, tr} from '../i18n';
import {dailyService, devotionalService} from '../api/contentService';
import {Devotional, StreakInfo, WeekDay} from '../api/types';
import {emptyWeek} from './DashboardScreen';

// Camino / Racha — anillo de progreso, semana, totales y devocionales anteriores.
export default function StreakScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {user, locale} = useAuth();
  const T = tr(locale);
  const en = locale === 'en';

  const [streak, setStreak] = useState<StreakInfo | null>(user?.streak || null);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [prev, setPrev] = useState<Devotional[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, rec] = await Promise.all([dailyService.streak(), devotionalService.recent(3)]);
        if (!alive) return;
        setStreak(s.streak);
        setWeek(s.week);
        setPrev(rec);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  const current = streak?.current ?? 0;
  const longest = streak?.longest ?? 0;
  const R = 78;
  const C = 2 * Math.PI * R;
  const pct = longest > 0 ? Math.min(1, current / longest) : current > 0 ? 1 : 0;

  const whenLabel = (i: number) => {
    if (i === 0) return en ? 'Yesterday' : 'Ayer';
    return en ? `${i + 1}d ago` : `Hace ${i + 1}d`;
  };

  return (
    <Sky testID="screen-streak" variant="day" scroll contentStyle={{paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 60}}>
      <View style={styles.header}>
        <IconButton testID="streak-back" name="arrowLeft" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{T.yourPath.toUpperCase()}</Text>
        <IconButton testID="streak-settings" name="settings" onPress={() => {}} />
      </View>

      {/* anillo */}
      <View style={styles.ringWrap}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={12} />
          <Circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={colors.skyDeep}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 100 100)"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text testID="streak-count" style={styles.ringNumber}>{current}</Text>
          <Text style={styles.ringLabel}>{T.days.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.ringCaption}>
        {en ? `${current} days walking with Him.` : `${current} días caminando con Él.`}
      </Text>

      {/* semana */}
      <CloudCard style={{padding: 18}}>
        <View style={styles.weekRow}>
          {(week.length ? week : emptyWeek()).map((d, i) => (
            <View key={i} style={styles.weekCell}>
              <Text style={styles.weekLabel}>{d.d}</Text>
              <View
                style={[
                  styles.weekDot,
                  d.done
                    ? {backgroundColor: colors.skyDeep}
                    : d.today
                    ? {backgroundColor: 'rgba(95,160,214,0.2)', borderWidth: 2, borderColor: colors.skyDeep}
                    : {backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: 'rgba(150,180,205,0.4)'},
                ]}>
                {d.done && <Icon name="check" size={15} color="#fff" />}
              </View>
            </View>
          ))}
        </View>
      </CloudCard>

      {/* totales */}
      <View style={styles.totalsRow}>
        <CloudCard style={styles.total}>
          <Text style={styles.totalNumber}>{streak?.totalPrayers ?? 0}</Text>
          <Text style={styles.totalLabel}>{T.prayers}</Text>
        </CloudCard>
        <CloudCard style={styles.total}>
          <Text style={styles.totalNumber}>{streak?.totalTasks ?? 0}</Text>
          <Text style={styles.totalLabel}>{T.tasksWritten}</Text>
        </CloudCard>
      </View>

      {/* devocionales anteriores */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{T.prevDevotionals.toUpperCase()}</Text>
        <Pressable testID="streak-see-all" onPress={() => navigation.navigate('Devocionales')} style={styles.link}>
          <Text style={styles.linkText}>{T.seeAllM}</Text>
          <Icon name="arrowRight" size={14} color={colors.skyDeep} />
        </Pressable>
      </View>
      <View style={{gap: 10}}>
        {prev.map((a, i) => (
          <CloudCard
            key={a._id}
            testID={`streak-devotional-${a._id}`}
            onPress={() => navigation.navigate('Lesson', {devotionalId: a._id})}
            style={styles.item}>
            <View style={styles.itemIcon}>
              <Icon name="book" size={18} color={colors.skyDeep} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.itemTitle} numberOfLines={1}>{L(a.quote, locale).replace(/[""]/g, '')}</Text>
              <Text style={styles.itemRef}>{L(a.reference, locale)}</Text>
            </View>
            <Text style={styles.itemWhen}>{whenLabel(i)}</Text>
          </CloudCard>
        ))}
      </View>
    </Sky>
  );
}


const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16},
  headerTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.earth},
  ringWrap: {alignItems: 'center', justifyContent: 'center', marginVertical: 6},
  ringCenter: {position: 'absolute', alignItems: 'center'},
  ringNumber: {fontFamily: font.display, fontWeight: '500', fontSize: 58, lineHeight: 60, color: colors.inkSoft},
  ringLabel: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.earth, marginTop: 4},
  ringCaption: {textAlign: 'center', marginTop: 4, marginBottom: 26, fontFamily: font.display, fontStyle: 'italic', fontSize: 19, color: colors.inkSoft},

  weekRow: {flexDirection: 'row', justifyContent: 'space-between'},
  weekCell: {alignItems: 'center', gap: 8},
  weekLabel: {fontFamily: font.body, fontSize: 12, fontWeight: '600', color: colors.earth},
  weekDot: {width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center'},

  totalsRow: {flexDirection: 'row', gap: 12, marginTop: 14},
  total: {flex: 1, padding: 18},
  totalNumber: {fontFamily: font.display, fontSize: 34, fontWeight: '500', color: colors.inkSoft},
  totalLabel: {fontFamily: font.body, fontSize: 13, color: colors.earth, marginTop: 4},

  sectionHead: {marginTop: 28, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sectionTitle: {fontFamily: font.body, fontSize: 11.5, fontWeight: '700', letterSpacing: 1.4, color: colors.earth},
  link: {flexDirection: 'row', alignItems: 'center', gap: 5},
  linkText: {fontFamily: font.body, fontSize: 13, fontWeight: '700', color: colors.skyDeep},
  item: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16},
  itemIcon: {width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(95,160,214,0.14)', alignItems: 'center', justifyContent: 'center'},
  itemTitle: {fontFamily: font.display, fontSize: 17, fontWeight: '500', color: colors.ink},
  itemRef: {fontFamily: font.body, fontSize: 12.5, color: colors.earth, marginTop: 2},
  itemWhen: {fontFamily: font.body, fontSize: 12, color: colors.sand},
});
