import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Easing,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {TAB_BAR_SPACE} from '../components/TabBar';
import Svg, {Circle} from 'react-native-svg';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {tr} from '../i18n';
import {conversationService} from '../api/contentService';
import {ChatMessage, Conversation} from '../api/types';

// Mensaje legible para el usuario: distingue "no hay servidor" de "sesión
// caducada" del resto, que es lo que más cuesta diagnosticar en el simulador.
function errorText(e: any, locale: string) {
  const en = locale === 'en';
  const status = e?.response?.status;
  if (!e?.response) {
    return en
      ? 'No connection to the server. Is the backend running?'
      : 'Sin conexión con el servidor. ¿Está encendido el backend?';
  }
  if (status === 401 || status === 403) {
    return en ? 'Your session expired. Sign in again.' : 'Tu sesión caducó. Inicia sesión de nuevo.';
  }
  return en ? 'Something went wrong. Try again.' : 'Algo salió mal. Inténtalo de nuevo.';
}

// Tres puntos que respiran, en una burbuja como las del compañero. La
// animación es de opacidad y desplazamiento, así que corre en el hilo nativo.
function TypingDots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, {toValue: 1, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true}),
          Animated.timing(d, {toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true}),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [dots]);

  return (
    <View style={[styles.row, {justifyContent: 'flex-start'}]}>
      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble, {borderBottomLeftRadius: 8}]}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: d.interpolate({inputRange: [0, 1], outputRange: [0.3, 1]}),
                transform: [{translateY: d.interpolate({inputRange: [0, 1], outputRange: [0, -4]})}],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

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
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>(route?.params?.title || T.companion);
  const scroller = useRef<ScrollView>(null);

  // Dentro de las tabs la barra flotante se dibuja encima del chat, así que la
  // caja de escribir tiene que subir para que el botón de enviar sea pulsable.
  // Con el teclado abierto la barra queda tapada y el hueco sobra.
  const [kb, setKb] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKb(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKb(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const bottomGap = switchTab && !kb ? TAB_BAR_SPACE + 10 : insets.bottom + 12;

  useEffect(() => {
    let alive = true;
    setLoading(true);
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
      } catch (e: any) {
        if (alive) setError(errorText(e, locale));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [paramId, forceNew]);

  const send = async () => {
    const mine = text.trim();
    if (!mine || sending) return;
    setError(null);
    setSending(true);
    setText('');
    setMessages(m => [...m, {role: 'user', text: mine}]);
    try {
      // Si la conversación aún no cargó, la creamos al vuelo.
      const c = convo ?? (await conversationService.create());
      if (!convo) setConvo(c);
      const res = await conversationService.send(c._id, mine);
      setMessages(m => [...m, res.reply]);
      if (res.title) setTitle(res.title);
    } catch (e: any) {
      // Devolvemos el texto al input para no perder lo que escribió.
      setMessages(m => m.slice(0, -1));
      setText(mine);
      setError(errorText(e, locale));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => scroller.current?.scrollToEnd({animated: true}), 60);
    return () => clearTimeout(id);
  }, [messages, sending]);

  const goBack = () => (switchTab ? switchTab('home') : navigation.goBack());

  return (
    <Sky testID="screen-chat" variant="soft" clouds={false}>
      {/* header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <IconButton testID="chat-back" name="arrowLeft" onPress={goBack} />
        <View style={styles.avatar}>
          <Svg width={20} height={20} viewBox="0 0 64 64">
            <Circle cx="32" cy="32" r="15" fill="none" stroke={colors.skyDeep} strokeWidth="2.4" />
            <Circle cx="32" cy="32" r="6.5" fill={colors.skyDeep} />
          </Svg>
        </View>
        <View style={{flex: 1}}>
          <Text testID="chat-title" style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle}>{locale === 'en' ? 'Jesus walks with you' : 'Jesús camina contigo'}</Text>
        </View>
        <IconButton testID="chat-list" name="list" onPress={() => navigation.navigate('Chats')} />
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
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.skyDeep} />
              <Text style={styles.loadingText}>
                {locale === 'en' ? 'Opening your space…' : 'Abriendo tu espacio…'}
              </Text>
            </View>
          )}
          {messages.map((m, i) => {
            const mine = m.role === 'user';
            return (
              <View
                key={i}
                testID={`chat-message-${mine ? 'user' : 'bot'}-${i}`}
                style={[styles.row, {justifyContent: mine ? 'flex-end' : 'flex-start'}]}>
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
          {sending && <TypingDots />}
        </ScrollView>

        {error && <Text testID="chat-error" style={styles.error}>{error}</Text>}

        {/* entrada */}
        <View style={[styles.inputBar, {marginBottom: bottomGap}]}>
          <TextInput
            testID="chat-input"
            value={text}
            onChangeText={setText}
            placeholder={T.writeHere}
            placeholderTextColor={colors.sand}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable
            testID="chat-send"
            onPress={send}
            disabled={sending || !text.trim()}
            style={[styles.sendBtn, (sending || !text.trim()) && {opacity: 0.45}]}>
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

  typingBubble: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16},
  dot: {width: 7, height: 7, borderRadius: 999, backgroundColor: colors.skyDeep},
  loading: {alignItems: 'center', gap: 10, paddingVertical: 34},
  loadingText: {fontFamily: font.body, fontSize: 13.5, color: colors.earth},
  error: {
    marginHorizontal: 22,
    marginBottom: 8,
    fontFamily: font.body,
    fontSize: 13,
    color: colors.earth,
    textAlign: 'center',
  },
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
