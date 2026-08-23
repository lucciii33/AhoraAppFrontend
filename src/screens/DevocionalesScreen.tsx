import React, {useEffect, useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {CloudCard, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';
import {L, tr} from '../i18n';
import {devotionalService} from '../api/contentService';
import {Devotional} from '../api/types';

const PER_PAGE = 6;

// Devocionales — biblioteca completa con paginación simple (6 por página).
export default function DevocionalesScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const T = tr(locale);

  const [items, setItems] = useState<Devotional[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    devotionalService
      .list(page, PER_PAGE)
      .then(res => {
        if (!alive) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [page]);

  const go = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <Sky testID="screen-devocionales" variant="day" scroll contentStyle={{paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 60}}>
      <View style={styles.header}>
        <IconButton testID="devocionales-back" name="arrowLeft" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{T.devotionals.toUpperCase()}</Text>
        <View style={{width: 40}} />
      </View>

      <Text style={styles.h1}>{locale === 'en' ? 'Your path,\nday by day.' : 'Tu camino,\ndía a día.'}</Text>
      <Text style={styles.count}>
        {total} {T.devotionals.toLowerCase()} · {totalPages} {T.pages}
      </Text>

      <View style={{gap: 11}}>
        {items.map(a => {
          const tint = a.tint === 'rose' ? colors.rose : colors.skyDeep;
          return (
            <CloudCard
              key={a._id}
              testID={`devocionales-item-${a._id}`}
              onPress={() => navigation.navigate('Lesson', {devotionalId: a._id})}
              style={styles.item}>
              <View style={[styles.itemIcon, {backgroundColor: tint + '1F'}]}>
                <Icon name="book" size={19} color={tint} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.itemTitle} numberOfLines={2}>{L(a.quote, locale).replace(/[""]/g, '')}</Text>
                <Text style={styles.itemRef}>{L(a.reference, locale)}</Text>
              </View>
            </CloudCard>
          );
        })}
      </View>

      {/* paginación */}
      <View style={styles.pagination}>
        <IconButton testID="devocionales-prev" name="arrowLeft" onPress={() => go(page - 1)} style={page === 1 ? {opacity: 0.4} : undefined} />
        {Array.from({length: totalPages}, (_, i) => i + 1).map(n => {
          const on = n === page;
          return (
            <Pressable
              key={n}
              testID={`devocionales-page-${n}`}
              onPress={() => go(n)}
              style={[styles.pageBtn, on ? styles.pageOn : styles.pageOff]}>
              <Text style={[styles.pageText, {color: on ? '#fff' : colors.earth}]}>{n}</Text>
            </Pressable>
          );
        })}
        <IconButton testID="devocionales-next" name="arrowRight" onPress={() => go(page + 1)} style={page === totalPages ? {opacity: 0.4} : undefined} />
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16},
  headerTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.earth},
  h1: {fontFamily: font.display, fontWeight: '500', fontSize: 34, lineHeight: 36, color: colors.inkSoft, marginBottom: 4},
  count: {fontFamily: font.body, fontSize: 14, color: colors.earth, marginBottom: 24},
  item: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16},
  itemIcon: {width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  itemTitle: {fontFamily: font.display, fontSize: 18, fontWeight: '500', color: colors.ink, lineHeight: 22},
  itemRef: {fontFamily: font.body, fontSize: 12.5, color: colors.earth, marginTop: 2},
  pagination: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 26},
  pageBtn: {width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center'},
  pageOn: {backgroundColor: colors.skyDeep},
  pageOff: {backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: colors.border},
  pageText: {fontFamily: font.body, fontSize: 14.5, fontWeight: '700'},
});
