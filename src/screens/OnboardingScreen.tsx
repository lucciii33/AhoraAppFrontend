import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {Button, IconButton, RisingSun} from '../components/ui';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';

// Onboarding — tres pasos serenos antes de crear la cuenta.
const OPTIONS: {es: string; en: string; key: string}[] = [
  {key: 'ansiedad', es: 'ansiedad', en: 'anxiety'},
  {key: 'miedo', es: 'miedo', en: 'fear'},
  {key: 'cansancio', es: 'cansancio', en: 'tiredness'},
  {key: 'tristeza', es: 'tristeza', en: 'sadness'},
  {key: 'incertidumbre', es: 'incertidumbre', en: 'uncertainty'},
  {key: 'soledad', es: 'soledad', en: 'loneliness'},
  {key: 'enojo', es: 'enojo', en: 'anger'},
  {key: 'prisa', es: 'prisa', en: 'hurry'},
];
const TIMES = ['5:30', '6:00', '6:30', '7:00', '7:30', '8:00'];

export default function OnboardingScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale, completeOnboarding} = useAuth();
  const en = locale === 'en';

  const [step, setStep] = useState(1);
  const [picks, setPicks] = useState<Set<string>>(new Set(['ansiedad']));
  const [time, setTime] = useState('6:30');

  const toggle = (k: string) =>
    setPicks(prev => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  const onBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };
  const onNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await completeOnboarding();
      navigation.navigate('Auth', {
        onboarding: {
          completed: true,
          entregar: [...picks],
          reminderTime: time,
        },
      });
    }
  };

  return (
    <Sky variant="day">
      <View style={[styles.wrap, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28}]}>
        <View style={styles.progressRow}>
          <IconButton name="arrowLeft" size={38} onPress={onBack} />
          <View style={styles.bars}>
            {[1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.bar, {backgroundColor: i <= step ? colors.skyDeep : 'rgba(255,255,255,0.6)'}]}
              />
            ))}
          </View>
        </View>

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.h1}>{en ? 'What do you want\nto surrender today?' : '¿Qué quieres\nentregar hoy?'}</Text>
            <Text style={styles.p}>
              {en ? 'Choose what weighs on you. We place it in His hands.' : 'Elige lo que pesa. Lo ponemos en Sus manos.'}
            </Text>
            <View style={styles.chips}>
              {OPTIONS.map(o => {
                const on = picks.has(o.key);
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => toggle(o.key)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.chipText, {color: on ? '#fff' : colors.inkSoft}]}>
                      {en ? o.en : o.es}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{flex: 1}} />
            <Button variant="primary" fullWidth onPress={onNext}>
              {en ? 'Continue' : 'Continuar'}
            </Button>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.h1}>{en ? 'When is your\ntime with God?' : '¿Cuándo es tu\nmomento con Dios?'}</Text>
            <Text style={styles.p}>
              {en ? 'We will remind you gently, like a sunrise.' : 'Te recordaremos con suavidad, como un amanecer.'}
            </Text>
            <View style={styles.times}>
              {TIMES.map(tt => {
                const on = time === tt;
                return (
                  <Pressable
                    key={tt}
                    onPress={() => setTime(tt)}
                    style={[styles.timeCell, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.timeText, {color: on ? '#fff' : colors.inkSoft}]}>{tt}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{flex: 1}} />
            <Button variant="primary" fullWidth onPress={onNext}>
              {en ? 'Continue' : 'Continuar'}
            </Button>
          </View>
        )}

        {step === 3 && (
          <View style={[styles.step, {alignItems: 'center', justifyContent: 'center'}]}>
            <RisingSun size={96} />
            <Text style={[styles.h1, {textAlign: 'center', marginTop: 22}]}>
              {en ? 'Your sky is ready.' : 'Tu cielo está listo.'}
            </Text>
            <Text style={[styles.p, {textAlign: 'center', maxWidth: 300}]}>
              {en
                ? 'Each morning a new word, a prayer, and a step of peace will be waiting for you.'
                : 'Cada mañana te esperará una palabra nueva, una oración y un paso de paz para tu día.'}
            </Text>
            <View style={{flex: 1}} />
            <Button variant="primary" fullWidth onPress={onNext} style={{alignSelf: 'stretch'}}>
              {en ? 'Create my space' : 'Crear mi espacio'}
            </Button>
          </View>
        )}
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: 26},
  progressRow: {flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28},
  bars: {flexDirection: 'row', gap: 7, flex: 1},
  bar: {flex: 1, height: 5, borderRadius: 999},
  step: {flex: 1},
  h1: {fontFamily: font.display, fontWeight: '500', fontSize: 34, lineHeight: 38, color: colors.inkSoft},
  p: {marginTop: 12, marginBottom: 26, fontFamily: font.body, fontSize: 15.5, lineHeight: 23, color: colors.earth},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  chip: {paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999},
  chipOn: {backgroundColor: colors.skyDeep},
  chipOff: {backgroundColor: 'rgba(255,255,255,0.66)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)'},
  chipText: {fontFamily: font.body, fontSize: 15, fontWeight: '600', textTransform: 'capitalize'},
  times: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  timeCell: {width: '31%', paddingVertical: 18, borderRadius: 18, alignItems: 'center'},
  timeText: {fontFamily: font.display, fontSize: 22, fontWeight: '500'},
});
