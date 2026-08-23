import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {CloudCard, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {tr} from '../i18n';
import {conversationService} from '../api/contentService';
import {ConversationSummary} from '../api/types';

// Conversaciones — historial agrupado por recencia + búsqueda + nueva.
export default function ChatsScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const T = tr(locale);
  const en = locale === 'en';

  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    conversationService
      .list(20)
      .then(list => alive && setItems(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? items.filter(c => (c.title + ' ' + c.preview).toLowerCase().includes(query))
      : items;

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = startToday - 6 * 86400000;

    const order = en ? ['Today', 'This week', 'Earlier'] : ['Hoy', 'Esta semana', 'Anteriores'];
    const buckets: Record<string, ConversationSummary[]> = {[order[0]]: [], [order[1]]: [], [order[2]]: []};
    filtered.forEach(c => {
      const t = new Date(c.lastMessageAt).getTime();
      if (t >= startToday) buckets[order[0]].push(c);
      else if (t >= weekAgo) buckets[order[1]].push(c);
      else buckets[order[2]].push(c);
    });
    return order.map(g => ({g, items: buckets[g]})).filter(x => x.items.length);
  }, [items, q, en]);

  const when = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString(en ? 'en-US' : 'es-ES', {hour: '2-digit', minute: '2-digit'});
    return d.toLocaleDateString(en ? 'en-US' : 'es-ES', {day: 'numeric', month: 'short'});
  };

  const openNew = () => navigation.navigate('Conversation', {new: true});

  return (
    <Sky testID="screen-chats" variant="day" scroll contentStyle={{paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 60}}>
      <View style={styles.header}>
        <IconButton testID="chats-back" name="arrowLeft" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{T.conversations.toUpperCase()}</Text>
        <IconButton testID="chats-new" name="plus" color="#fff" bg={colors.skyDeep} onPress={openNew} />
      </View>

      <Text style={styles.h1}>{T.yourChats}</Text>

      <View style={styles.search}>
        <Icon name="search" size={17} color={colors.earth} />
        <TextInput
          testID="chats-search-input"
          value={q}
          onChangeText={setQ}
          placeholder={T.search}
          placeholderTextColor={colors.sand}
          style={styles.searchInput}
        />
      </View>

      <CloudCard testID="chats-new-card" onPress={openNew} style={styles.newCard}>
        <View style={styles.newIcon}>
          <Icon name="plus" size={20} color={colors.skyDeep} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.newTitle}>{T.newConversation}</Text>
          <Text style={styles.newSub}>{T.talkHeart}</Text>
        </View>
        <Icon name="arrowRight" size={18} color={colors.earth} />
      </CloudCard>

      {groups.map(grp => (
        <View key={grp.g} style={{marginBottom: 18}}>
          <Text style={styles.groupLabel}>{grp.g.toUpperCase()}</Text>
          <View style={{gap: 10}}>
            {grp.items.map(c => (
              <CloudCard
                key={c._id}
                testID={`chats-item-${c._id}`}
                onPress={() => navigation.navigate('Conversation', {conversationId: c._id, title: c.title})}
                style={styles.item}>
                <View style={styles.itemIcon}>
                  <Icon name="chat" size={18} color={colors.skyDeep} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.itemPreview} numberOfLines={1}>{c.preview}</Text>
                </View>
                <Text style={styles.itemWhen}>{when(c.lastMessageAt)}</Text>
              </CloudCard>
            ))}
          </View>
        </View>
      ))}

      {!groups.length && (
        <Text testID="chats-empty" style={styles.empty}>
          {q.trim()
            ? en
              ? `No conversations for "${q}".`
              : `No encontramos conversaciones con «${q}».`
            : en
            ? 'Start your first conversation.'
            : 'Empieza tu primera conversación.'}
        </Text>
      )}
    </Sky>
  );
}

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18},
  headerTitle: {fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.earth},
  h1: {fontFamily: font.display, fontWeight: '500', fontSize: 34, lineHeight: 36, color: colors.inkSoft, marginBottom: 16},
  search: {flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, marginBottom: 22},
  searchInput: {flex: 1, fontFamily: font.body, fontSize: 14.5, color: colors.ink, padding: 0},
  newCard: {flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 22},
  newIcon: {width: 42, height: 42, borderRadius: 999, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center', ...shadow.rest},
  newTitle: {fontFamily: font.display, fontSize: 19, fontWeight: '500', color: colors.ink},
  newSub: {fontFamily: font.body, fontSize: 13, color: colors.earth},
  groupLabel: {marginHorizontal: 4, marginBottom: 10, fontFamily: font.body, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, color: colors.sand},
  item: {flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15},
  itemIcon: {width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(85,112,196,0.12)', alignItems: 'center', justifyContent: 'center'},
  itemTitle: {fontFamily: font.display, fontSize: 17.5, fontWeight: '500', color: colors.ink},
  itemPreview: {fontFamily: font.body, fontSize: 13, color: colors.earth, marginTop: 2},
  itemWhen: {fontFamily: font.body, fontSize: 12, color: colors.sand},
  empty: {textAlign: 'center', marginTop: 40, fontFamily: font.display, fontStyle: 'italic', fontSize: 18, color: colors.earth},
});
