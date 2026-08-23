import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Sky} from '../components/Sky';
import {AppHeader, Button, IconButton} from '../components/ui';
import {Icon} from '../components/Icon';
import {colors, font, shadow} from '../theme';
import {useAuth} from '../context/AuthContext';
import {Locale} from '../i18n';

// Ajustes. Vive detrás del icono de la rueda del Dashboard (antes había una
// campana que abría los avisos in-app; ver DashboardScreen).
const LANGUAGES: {key: Locale; label: string}[] = [
  {key: 'es', label: 'Español'},
  {key: 'en', label: 'English'},
];

export default function SettingsScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const {locale, setLocale, user, updateProfile} = useAuth();
  const en = locale === 'en';

  // Perfil editable. Se rellena con lo que ya hay y solo se envía al guardar.
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [country, setCountry] = useState(user?.country || '');
  const [saving, setSaving] = useState(false);

  // La fecha de nacimiento se muestra, no se edita aquí: se fija una vez en
  // el onboarding y cambiarla es raro. La edad la calcula el backend.
  const nacimiento = user?.birthDate
    ? new Date(user.birthDate).toLocaleDateString(en ? 'en-US' : 'es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;

  const saveProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert(
        en ? 'What is your name?' : '¿Cómo te llamas?',
        en ? 'Your name cannot be empty.' : 'El nombre no puede quedar vacío.',
      );
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country.trim(),
      });
      Alert.alert(en ? 'Saved' : 'Guardado');
    } catch (e: any) {
      Alert.alert(en ? 'Could not save' : 'No se pudo guardar', e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sky
      testID="screen-settings"
      variant="day"
      scroll
      contentStyle={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 22,
        paddingBottom: insets.bottom + 60,
      }}>
      <AppHeader
        left={<IconButton testID="settings-back" name="arrowLeft" onPress={() => navigation.goBack()} />}
        title={en ? 'SETTINGS' : 'AJUSTES'}
      />

      <Text style={styles.h1}>{en ? 'Your profile' : 'Tu perfil'}</Text>
      <Text style={styles.p}>{user?.email}</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>{en ? 'NAME' : 'NOMBRE'}</Text>
        <TextInput
          testID="settings-firstname-input"
          value={firstName}
          onChangeText={setFirstName}
          placeholder={en ? 'Your name' : 'Tu nombre'}
          placeholderTextColor={colors.sand}
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>{en ? 'LAST NAME' : 'APELLIDO'}</Text>
        <TextInput
          testID="settings-lastname-input"
          value={lastName}
          onChangeText={setLastName}
          placeholder={en ? 'Your last name' : 'Tu apellido'}
          placeholderTextColor={colors.sand}
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>{en ? 'COUNTRY' : 'PAÍS'}</Text>
        <TextInput
          testID="settings-country-input"
          value={country}
          onChangeText={setCountry}
          placeholder={en ? 'Where do you live?' : '¿Dónde vives?'}
          placeholderTextColor={colors.sand}
          style={styles.input}
          autoCapitalize="words"
        />

        {nacimiento && (
          <>
            <Text style={styles.label}>
              {en ? 'DATE OF BIRTH' : 'FECHA DE NACIMIENTO'}
            </Text>
            <Text style={styles.readonly}>
              {nacimiento}
              {user?.age != null
                ? en
                  ? `  ·  ${user.age} years`
                  : `  ·  ${user.age} años`
                : ''}
            </Text>
          </>
        )}

        <View style={{marginTop: 14}}>
          <Button testID="settings-save" variant="primary" fullWidth loading={saving} onPress={saveProfile}>
            {en ? 'Save' : 'Guardar'}
          </Button>
        </View>
      </View>

      <Text style={[styles.h1, {marginTop: 34}]}>{en ? 'Language' : 'Idioma'}</Text>
      <Text style={styles.p}>
        {en
          ? 'Your path and your Companion will speak in the language you choose.'
          : 'Tu camino y tu Compañero te hablarán en el idioma que elijas.'}
      </Text>

      <View style={styles.card}>
        {LANGUAGES.map((l, i) => {
          const on = locale === l.key;
          return (
            <Pressable
              key={l.key}
              testID={`settings-lang-${l.key}`}
              onPress={() => setLocale(l.key)}
              style={({pressed}) => [
                styles.row,
                i > 0 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}>
              <Text
                style={[
                  styles.rowLabel,
                  {color: on ? colors.skyDeep : colors.inkSoft},
                ]}>
                {l.label}
              </Text>
              {on && <Icon name="check" size={19} color={colors.skyDeep} />}
            </Pressable>
          );
        })}
      </View>
    </Sky>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: font.display,
    fontWeight: '500',
    fontSize: 30,
    color: colors.inkSoft,
  },
  p: {
    marginTop: 10,
    marginBottom: 26,
    fontFamily: font.body,
    fontSize: 15.5,
    lineHeight: 23,
    color: colors.earth,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    overflow: 'hidden',
    ...shadow.rest,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 19,
    paddingHorizontal: 20,
  },
  rowPressed: {backgroundColor: 'rgba(255,255,255,0.5)'},
  rowBorder: {borderTopWidth: 1, borderTopColor: colors.border},
  rowLabel: {fontFamily: font.body, fontSize: 17},
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 6,
    ...shadow.rest,
  },
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 6,
  },
  readonly: {
    fontFamily: font.body,
    fontSize: 16,
    color: colors.inkSoft,
    paddingVertical: 6,
  },
});
