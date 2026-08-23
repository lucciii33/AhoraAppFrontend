import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {Button, IconButton, RisingSun} from '../components/ui';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';
import {Locale} from '../i18n';

// Onboarding — cuatro pasos serenos antes de crear la cuenta.
// El primero es el idioma: todo lo que viene después ya se ve en él.
const LANGUAGES: {key: Locale; label: string; caption: string}[] = [
  {key: 'es', label: 'Español', caption: 'Continuar en español'},
  {key: 'en', label: 'English', caption: 'Continue in English'},
];

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
// Todas las horas del día, de 12:00 AM a 11:30 PM, cada media hora.
const TIMES = Array.from({length: 48}, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? '30' : '00';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    value: `${String(h).padStart(2, '0')}:${m}`,
    label: `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`,
  };
});

export default function OnboardingScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale, setLocale, completeOnboarding} = useAuth();
  const en = locale === 'en';

  const [step, setStep] = useState(1);
  const [picks, setPicks] = useState<Set<string>>(new Set(['ansiedad']));
  const [time, setTime] = useState('06:30');

  // Datos de la persona (paso 2). Solo el nombre es obligatorio; el resto
  // se puede completar más tarde en Ajustes.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [country, setCountry] = useState('');

  const TOTAL_STEPS = 5;

  // Junta los tres campos en una fecha ISO. Devuelve:
  //   null      -> no puso nada (es opcional, se sigue)
  //   undefined -> puso algo pero no cuadra (hay que avisarle)
  const parseBirthDate = (): string | null | undefined => {
    const d = birthDay.trim();
    const m = birthMonth.trim();
    const y = birthYear.trim();
    if (!d && !m && !y) return null;
    if (!d || !m || !y) return undefined;

    const dd = Number(d);
    const mm = Number(m);
    const yy = Number(y);
    if (!dd || !mm || !yy || yy < 1900) return undefined;

    const fecha = new Date(Date.UTC(yy, mm - 1, dd));
    // Rebota los días que no existen: el 31 de febrero rueda a marzo.
    if (
      fecha.getUTCDate() !== dd ||
      fecha.getUTCMonth() !== mm - 1 ||
      fecha.getUTCFullYear() !== yy ||
      fecha.getTime() > Date.now()
    ) {
      return undefined;
    }
    return fecha.toISOString();
  };

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
  // Elegir idioma lo aplica al momento y avanza: el resto del onboarding, y
  // la pantalla de acceso, ya se ven en el idioma elegido. Al crear la cuenta
  // viaja en `locale` a `request-code` y se guarda en el perfil.
  const pickLanguage = async (l: Locale) => {
    await setLocale(l);
    setStep(2);
  };

  const onNext = async () => {
    if (step === 2) {
      if (!firstName.trim()) {
        Alert.alert(
          en ? 'What is your name?' : '¿Cómo te llamas?',
          en ? 'Please enter your name.' : 'Escribe tu nombre para continuar.',
        );
        return;
      }
      if (parseBirthDate() === undefined) {
        Alert.alert(
          en ? 'Check the date' : 'Revisa la fecha',
          en
            ? 'Enter a valid date of birth, or leave it empty.'
            : 'Escribe una fecha de nacimiento válida, o déjala vacía.',
        );
        return;
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await completeOnboarding();
      navigation.navigate('Auth', {
        // El perfil viaja a la pantalla de acceso y se guarda con
        // `updateProfile` en cuanto el código verifica y hay token.
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate: parseBirthDate() ?? null,
          country: country.trim(),
        },
        onboarding: {
          completed: true,
          entregar: [...picks],
          reminderTime: time,
        },
      });
    }
  };

  return (
    <Sky variant="day" testID={`screen-onboarding-${step}`}>
      <View style={[styles.wrap, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28}]}>
        <View style={styles.progressRow}>
          <IconButton testID="onboarding-back" name="arrowLeft" size={38} onPress={onBack} />
          <View style={styles.bars}>
            {[1, 2, 3, 4, 5].map(i => (
              <View
                key={i}
                style={[styles.bar, {backgroundColor: i <= step ? colors.skyDeep : 'rgba(255,255,255,0.6)'}]}
              />
            ))}
          </View>
        </View>

        {step === 1 && (
          <View style={styles.step}>
            {/* Bilingüe a propósito: aún no sabemos qué idioma habla. */}
            <Text style={styles.h1}>{'Elige tu idioma\nChoose your language'}</Text>
            <Text style={styles.p}>
              Puedes cambiarlo cuando quieras. · You can change it anytime.
            </Text>
            <View style={styles.langs}>
              {LANGUAGES.map(l => {
                const on = locale === l.key;
                return (
                  <Pressable
                    key={l.key}
                    testID={`onboarding-lang-${l.key}`}
                    onPress={() => pickLanguage(l.key)}
                    style={[styles.lang, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.langLabel, {color: on ? '#fff' : colors.inkSoft}]}>
                      {l.label}
                    </Text>
                    <Text
                      style={[
                        styles.langCaption,
                        {color: on ? 'rgba(255,255,255,0.85)' : colors.earth},
                      ]}>
                      {l.caption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{flex: 1}} />
          </View>
        )}

        {step === 2 && (
          <KeyboardAvoidingView
            style={styles.step}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.h1}>{en ? 'Tell us\nabout you' : 'Cuéntanos\nde ti'}</Text>
            <Text style={styles.p}>
              {en
                ? 'So this space feels like yours. Only your name is required.'
                : 'Para que este espacio se sienta tuyo. Solo el nombre es obligatorio.'}
            </Text>

            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>{en ? 'NAME' : 'NOMBRE'}</Text>
              <TextInput
                testID="onboarding-firstname-input"
                value={firstName}
                onChangeText={setFirstName}
                placeholder={en ? 'Your name' : 'Tu nombre'}
                placeholderTextColor={colors.sand}
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={styles.label}>
                {en ? 'LAST NAME (OPTIONAL)' : 'APELLIDO (OPCIONAL)'}
              </Text>
              <TextInput
                testID="onboarding-lastname-input"
                value={lastName}
                onChangeText={setLastName}
                placeholder={en ? 'Your last name' : 'Tu apellido'}
                placeholderTextColor={colors.sand}
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={styles.label}>
                {en ? 'DATE OF BIRTH (OPTIONAL)' : 'FECHA DE NACIMIENTO (OPCIONAL)'}
              </Text>
              <View style={styles.dateRow}>
                <TextInput
                  testID="onboarding-birthday-input"
                  value={birthDay}
                  onChangeText={setBirthDay}
                  placeholder={en ? 'DD' : 'DD'}
                  placeholderTextColor={colors.sand}
                  style={[styles.input, styles.dateCell]}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  testID="onboarding-birthmonth-input"
                  value={birthMonth}
                  onChangeText={setBirthMonth}
                  placeholder={en ? 'MM' : 'MM'}
                  placeholderTextColor={colors.sand}
                  style={[styles.input, styles.dateCell]}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  testID="onboarding-birthyear-input"
                  value={birthYear}
                  onChangeText={setBirthYear}
                  placeholder={en ? 'YYYY' : 'AAAA'}
                  placeholderTextColor={colors.sand}
                  style={[styles.input, styles.dateCellYear]}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <Text style={styles.label}>
                {en ? 'COUNTRY (OPTIONAL)' : 'PAÍS (OPCIONAL)'}
              </Text>
              <TextInput
                testID="onboarding-country-input"
                value={country}
                onChangeText={setCountry}
                placeholder={en ? 'Where do you live?' : '¿Dónde vives?'}
                placeholderTextColor={colors.sand}
                style={styles.input}
                autoCapitalize="words"
              />
            </ScrollView>

            <Button testID="onboarding-continue" variant="primary" fullWidth onPress={onNext}>
              {en ? 'Continue' : 'Continuar'}
            </Button>
          </KeyboardAvoidingView>
        )}

        {step === 3 && (
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
                    testID={`onboarding-chip-${o.key}`}
                    // Lo elegido solo se veía en el color de fondo. Publicarlo
                    // como estado de accesibilidad hace que VoiceOver lo anuncie
                    // y que las pruebas puedan comprobarlo.
                    accessibilityRole="button"
                    accessibilityState={{selected: on}}
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
            <Button testID="onboarding-continue" variant="primary" fullWidth onPress={onNext}>
              {en ? 'Continue' : 'Continuar'}
            </Button>
          </View>
        )}

        {step === 4 && (
          <View style={styles.step}>
            <Text style={styles.h1}>{en ? 'When is your\ntime with God?' : '¿Cuándo es tu\nmomento con Dios?'}</Text>
            <Text style={styles.p}>
              {en ? 'We will remind you gently, like a sunrise.' : 'Te recordaremos con suavidad, como un amanecer.'}
            </Text>
            <ScrollView
              style={styles.timesScroll}
              contentContainerStyle={styles.times}
              showsVerticalScrollIndicator={false}>
              {TIMES.map(tt => {
                const on = time === tt.value;
                return (
                  <Pressable
                    key={tt.value}
                    testID={`onboarding-time-${tt.value}`}
                    onPress={() => setTime(tt.value)}
                    style={[styles.timeCell, on ? styles.chipOn : styles.chipOff]}>
                    <Text style={[styles.timeText, {color: on ? '#fff' : colors.inkSoft}]}>{tt.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button testID="onboarding-continue" variant="primary" fullWidth onPress={onNext}>
              {en ? 'Continue' : 'Continuar'}
            </Button>
          </View>
        )}

        {step === 5 && (
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
            <Button testID="onboarding-create" variant="primary" fullWidth onPress={onNext} style={{alignSelf: 'stretch'}}>
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
  langs: {gap: 12},
  lang: {paddingVertical: 20, paddingHorizontal: 22, borderRadius: 22},
  langLabel: {fontFamily: font.display, fontSize: 24, fontWeight: '500'},
  langCaption: {marginTop: 4, fontFamily: font.body, fontSize: 14.5},
  chip: {paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999},
  chipOn: {backgroundColor: colors.skyDeep},
  chipOff: {backgroundColor: 'rgba(255,255,255,0.66)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)'},
  chipText: {fontFamily: font.body, fontSize: 15, fontWeight: '600', textTransform: 'capitalize'},
  formScroll: {flex: 1, marginBottom: 18},
  label: {
    fontFamily: font.body,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.earth,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 6,
  },
  dateRow: {flexDirection: 'row', gap: 10},
  dateCell: {flex: 1, textAlign: 'center'},
  dateCellYear: {flex: 1.5, textAlign: 'center'},
  timesScroll: {flex: 1, marginBottom: 18},
  times: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingBottom: 8},
  timeCell: {width: '31.5%', paddingVertical: 14, borderRadius: 18, alignItems: 'center'},
  timeText: {fontFamily: font.display, fontSize: 17, fontWeight: '500'},
});
