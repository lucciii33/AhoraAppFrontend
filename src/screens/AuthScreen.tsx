import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {Button, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font} from '../theme';
import {useAuth} from '../context/AuthContext';

// Auth — acceso por código (OTP). Paso 1: correo → enviamos código.
// Paso 2: escribir el código → entrar. SSO (Apple/Google) queda listo para
// habilitarse más adelante.
export default function AuthScreen({navigation, route}: any) {
  const insets = useSafeAreaInsets();
  const {locale, requestCode, verifyCode, updateProfile} = useAuth();
  const en = locale === 'en';
  const onboardingParam = route?.params?.onboarding;

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const sendCode = async () => {
    if (!email.trim().includes('@')) {
      Alert.alert(en ? 'Check your email' : 'Revisa tu correo', en ? 'Enter a valid email.' : 'Introduce un correo válido.');
      return;
    }
    setBusy(true);
    try {
      const res = await requestCode({
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        locale,
      });
      setStep('code');
      // En dev con driver stub el backend devuelve el código para probar.
      if (res.devCode) setHint(`Dev: ${res.devCode}`);
    } catch (e: any) {
      Alert.alert(en ? 'Could not send' : 'No se pudo enviar', e?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.trim().length < 4) {
      Alert.alert(en ? 'Missing code' : 'Falta el código', en ? 'Enter the code.' : 'Escribe el código.');
      return;
    }
    setBusy(true);
    try {
      await verifyCode({email: email.trim(), code: code.trim()});
      if (onboardingParam) {
        try {
          await updateProfile({firstName: firstName.trim() || undefined, locale, onboarding: onboardingParam});
        } catch {}
      }
      // El token activa la navegación a Main automáticamente.
    } catch (e: any) {
      Alert.alert(en ? 'Wrong code' : 'Código incorrecto', e?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sky variant="day">
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.wrap, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28}]}>
          <IconButton
            name="arrowLeft"
            size={38}
            onPress={() => (step === 'code' ? setStep('email') : navigation.goBack())}
            style={{marginBottom: 26}}
          />

          {step === 'email' ? (
            <>
              <Text style={styles.h1}>{en ? 'Create your space' : 'Crea tu espacio'}</Text>
              <Text style={styles.p}>
                {en ? 'A serene place to meet Him each day.' : 'Un lugar sereno para encontrarte con Él cada día.'}
              </Text>

              <Text style={styles.label}>{en ? 'NAME (OPTIONAL)' : 'NOMBRE (OPCIONAL)'}</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder={en ? 'Your name' : 'Tu nombre'}
                placeholderTextColor={colors.sand}
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={styles.label}>{en ? 'EMAIL' : 'CORREO'}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.sand}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />

              <View style={{marginTop: 16}}>
                <Button variant="primary" fullWidth loading={busy} onPress={sendCode}>
                  {en ? 'Send me a code' : 'Enviarme un código'}
                </Button>
              </View>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>{en ? 'or continue with' : 'o continúa con'}</Text>
                <View style={styles.line} />
              </View>

              <View style={{gap: 10}}>
                <SocialButton icon="apple" label="Apple" />
                <SocialButton icon="google" label="Google" />
              </View>
              <Text style={styles.soon}>{en ? 'SSO coming soon' : 'SSO próximamente'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.h1}>{en ? 'Check your email' : 'Revisa tu correo'}</Text>
              <Text style={styles.p}>
                {en ? `We sent a code to ${email}.` : `Te enviamos un código a ${email}.`}
              </Text>

              <Text style={styles.label}>{en ? 'CODE' : 'CÓDIGO'}</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="••••••"
                placeholderTextColor={colors.sand}
                style={[styles.input, styles.codeInput]}
                keyboardType="number-pad"
                maxLength={6}
              />
              {hint && <Text style={styles.hint}>{hint}</Text>}

              <View style={{marginTop: 16}}>
                <Button variant="primary" fullWidth loading={busy} onPress={verify}>
                  {en ? 'Enter' : 'Entrar'}
                </Button>
              </View>

              <Pressable onPress={sendCode} style={styles.resend}>
                <Text style={styles.resendText}>{en ? 'Resend code' : 'Reenviar código'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Sky>
  );
}

function SocialButton({icon, label}: {icon: 'apple' | 'google'; label: string}) {
  return (
    <View style={styles.social}>
      <Icon name={icon} size={20} color={colors.ink} />
      <Text style={styles.socialText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: 28},
  h1: {fontFamily: font.display, fontWeight: '500', fontSize: 38, lineHeight: 42, color: colors.inkSoft},
  p: {marginTop: 12, marginBottom: 24, fontFamily: font.body, fontSize: 15.5, lineHeight: 23, color: colors.earth},
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
  codeInput: {fontSize: 24, letterSpacing: 8, textAlign: 'center'},
  hint: {marginTop: 6, fontFamily: font.body, fontSize: 13, color: colors.skyDeep},
  divider: {flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22},
  line: {flex: 1, height: 1, backgroundColor: colors.border},
  dividerText: {fontFamily: font.body, fontSize: 13, color: colors.earth},
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.55,
  },
  socialText: {fontFamily: font.body, fontSize: 15.5, fontWeight: '600', color: colors.ink},
  soon: {marginTop: 10, textAlign: 'center', fontFamily: font.body, fontSize: 12, color: colors.sand},
  resend: {alignItems: 'center', paddingVertical: 14},
  resendText: {fontFamily: font.body, fontSize: 14.5, fontWeight: '700', color: colors.skyDeep},
});
