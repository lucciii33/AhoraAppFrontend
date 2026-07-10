import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import Svg, {Circle} from 'react-native-svg';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {tr} from '../i18n';
import {conversationService} from '../api/contentService';
import {ChatMessage, Conversation} from '../api/types';

// Compañero — chat espiritual con Jesús. Tab (última/nueva conversación) o
// detalle apilado con {conversationId}.
export default function ChatScreen({navigation, route, switchTab}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const T = tr(locale);
  const paramId: string | undefined = route?.params?.conversationId;
  const forceNew: boolean = !!route?.params?.new;

  const [convo, setConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [title, setTitle] = useState<string>(route?.params?.title || T.companion);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let c: Conversation;
        if (paramId) {
          c = await conversationService.get(paramId);
        } else if (forceNew) {
          c = await conversationService.create();
        } else {
          const list = await conversationService.list(1);
          c = list.length
            ? await conversationService.get(list[0]._id)
            : await conversationService.create();
        }
        if (!alive) return;
        setConvo(c);
        setMessages(c.messages);
        setTitle(c.title && c.title !== 'Nueva conversación' ? c.title : T.companion);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [paramId, forceNew]);

  const send = async () => {
    const mine = text.trim();
    if (!mine || !convo) return;
    setText('');
    setMessages(m => [...m, {role: 'user', text: mine}]);
    try {
      const res = await conversationService.send(convo._id, mine);
      setMessages(m => [...m, res.reply]);
      if (res.title) setTitle(res.title);
    } catch {}
  };

  useEffect(() => {
    const id = setTimeout(() => scroller.current?.scrollToEnd({animated: true}), 60);
    return () => clearTimeout(id);
  }, [messages]);

  const goBack = () => (switchTab ? switchTab('home') : navigation.goBack());

  return (
    <Sky variant="soft" clouds={false}>
      {/* header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <IconButton name="arrowLeft" onPress={goBack} />
        <View style={styles.avatar}>
          <Svg width={20} height={20} viewBox="0 0 64 64">
            <Circle cx="32" cy="32" r="15" fill="none" stroke={colors.skyDeep} strokeWidth="2.4" />
            <Circle cx="32" cy="32" r="6.5" fill={colors.skyDeep} />
          </Svg>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle}>{locale === 'en' ? 'Jesus walks with you' : 'Jesús camina contigo'}</Text>
        </View>
        <IconButton name="list" onPress={() => navigation.navigate('Chats')} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          ref={scroller}
          style={{flex: 1}}
          contentContainerStyle={{padding: 16, paddingBottom: 20}}
          showsVerticalScrollIndicator={false}>
          {messages.map((m, i) => {
            const mine = m.role === 'user';
            return (
              <View key={i} style={[styles.row, {justifyContent: mine ? 'flex-end' : 'flex-start'}]}>
                <View
                  style={[
                    styles.bubble,
                    mine ? styles.bubbleMine : styles.bubbleBot,
                    mine ? {borderBottomRightRadius: 8} : {borderBottomLeftRadius: 8},
                  ]}>
                  <Text style={[styles.bubbleText, {color: mine ? '#fff' : colors.ink}]}>{m.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* entrada */}
        <View style={[styles.inputBar, {marginBottom: insets.bottom + 12}]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={T.writeHere}
            placeholderTextColor={colors.sand}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Icon name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Sky>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: 'rgba(243,248,252,0.85)',
  },
  avatar: {width: 42, height: 42, borderRadius: 999, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center', ...shadow.rest},
  title: {fontFamily: font.display, fontSize: 21, fontWeight: '500', color: colors.ink},
  subtitle: {fontFamily: font.body, fontSize: 12.5, color: colors.earth},

  row: {flexDirection: 'row', marginBottom: 12},
  bubble: {maxWidth: '80%', paddingVertical: 13, paddingHorizontal: 17, borderRadius: 22},
  bubbleMine: {backgroundColor: colors.skyDeep, ...shadow.rest},
  bubbleBot: {backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)', ...shadow.rest},
  bubbleText: {fontFamily: font.body, fontSize: 15, lineHeight: 22},

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...shadow.lift,
  },
  input: {flex: 1, fontFamily: font.body, fontSize: 15, color: colors.ink, paddingHorizontal: 12, paddingVertical: 8},
  sendBtn: {width: 42, height: 42, borderRadius: 999, backgroundColor: colors.skyDeep, alignItems: 'center', justifyContent: 'center'},
});
