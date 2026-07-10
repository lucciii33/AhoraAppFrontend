import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {Button, RisingSun, Wordmark} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';

// Welcome — escena de cielo al amanecer. Sol naciente, tagline y CTA.
export default function WelcomeScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale} = useAuth();
  const en = locale === 'en';

  return (
    <Sky variant="dawn">
      <View style={[styles.wrap, {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32}]}>
        <View style={styles.brand}>
          <Icon name="sun" size={18} color={colors.sky} />
          <Wordmark size={24} />
        </View>

        <View style={styles.hero}>
          <RisingSun size={104} />
          <Text style={styles.title}>
            {en ? 'Walk today\nby His hand.' : 'Camina hoy\nde Su mano.'}
          </Text>
          <Text style={styles.sub}>
            {en
              ? 'A moment with God each morning: a word, a prayer, and a step of peace.'
              : 'Un momento con Dios cada mañana: una palabra, una oración y un paso de paz.'}
          </Text>
        </View>

        <View style={{gap: 12}}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('Onboarding')}
            iconRight={<Icon name="arrowRight" size={18} color="#fff" />}>
            {en ? 'Start my path' : 'Comenzar mi camino'}
          </Button>
          <Pressable onPress={() => navigation.navigate('Auth')} style={styles.link}>
            <Text style={styles.linkText}>
              {en ? 'I already have an account' : 'Ya tengo una cuenta'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: 28},
  brand: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9},
  hero: {flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 10},
  title: {
    marginTop: 26,
    fontFamily: font.display,
    fontWeight: '500',
    fontSize: 44,
    lineHeight: 48,
    textAlign: 'center',
    color: colors.inkSoft,
  },
  sub: {
    marginTop: 16,
    maxWidth: 300,
    fontFamily: font.body,
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    color: colors.earth,
  },
  link: {alignItems: 'center', paddingVertical: 6},
  linkText: {fontFamily: font.body, fontSize: 15, fontWeight: '600', color: colors.earth},
});
