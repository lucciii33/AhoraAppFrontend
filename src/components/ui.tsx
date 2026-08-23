import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {colors, font, radius, shadow, space} from '../theme';
import {Icon, IconName} from './Icon';

// ─── Tarjeta-nube translúcida ───────────────────────────────────
export function CloudCard({
  children,
  style,
  onPress,
  testID,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}) {
  const inner = (
    <View style={[styles.card, style]} testID={onPress ? undefined : testID}>
      {children}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({pressed}) => (pressed ? styles.pressed : undefined)}>
      {inner}
    </Pressable>
  );
}

// ─── Botón (pill) ───────────────────────────────────────────────
type Variant = 'primary' | 'soft' | 'ghost' | 'leaf';
type Size = 'lg' | 'md' | 'sm';

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  fullWidth,
  loading,
  style,
  testID,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      testID={testID}
      style={({pressed}) => [
        styles.btn,
        s.btn,
        v.btn,
        fullWidth && {alignSelf: 'stretch'},
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.text.color as string} />
      ) : (
        <>
          {icon}
          {typeof children === 'string' ? (
            <Text style={[styles.btnText, s.text, v.text]}>{children}</Text>
          ) : (
            children
          )}
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

// ─── Botón-icono circular translúcido ───────────────────────────
export function IconButton({
  name,
  onPress,
  color = colors.earth,
  bg = 'rgba(255,255,255,0.7)',
  size = 40,
  style,
  testID,
}: {
  name: IconName;
  onPress?: () => void;
  color?: string;
  bg?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [
        styles.iconBtn,
        {width: size, height: size, backgroundColor: bg},
        pressed && styles.pressed,
        style,
      ]}>
      <Icon name={name} size={18} color={color} />
    </Pressable>
  );
}

// ─── Wordmark ───────────────────────────────────────────────────
export function Wordmark({size = 24, color = colors.ink}: {size?: number; color?: string}) {
  return (
    <Text style={{fontFamily: font.display, fontSize: size, fontWeight: '500', letterSpacing: 3, color, lineHeight: size * 1.1}}>
      AHORA
    </Text>
  );
}

// ─── Sol naciente ───────────────────────────────────────────────
export function RisingSun({size = 96}: {size?: number}) {
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <View
        style={{
          position: 'absolute',
          width: size * 1.9,
          height: size * 1.9,
          borderRadius: size,
          backgroundColor: 'rgba(166,205,234,0.28)',
        }}
      />
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Circle cx="32" cy="32" r="15" fill="none" stroke={colors.sky} strokeWidth="1.1" />
        <Circle cx="32" cy="32" r="6.5" fill={colors.sky} />
      </Svg>
    </View>
  );
}

// ─── Encabezado de pantalla ─────────────────────────────────────
export function AppHeader({
  left,
  title,
  right,
}: {
  left?: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>{left}</View>
      {!!title && <Text style={styles.headerTitle}>{title}</Text>}
      <View style={[styles.headerSide, {alignItems: 'flex-end'}]}>{right}</View>
    </View>
  );
}

// ─── Estación del recorrido del día ─────────────────────────────
export function Station({
  time,
  icon,
  accent = colors.sky,
  title,
  done,
  isLast,
  children,
  testID,
}: {
  time: string;
  icon: IconName;
  accent?: string;
  title: string;
  done?: boolean;
  isLast?: boolean;
  children?: React.ReactNode;
  testID?: string;
}) {
  return (
    <View style={styles.station} testID={testID}>
      {/* riel */}
      <View style={styles.rail}>
        <View
          testID={done && testID ? `${testID}-done` : undefined}
          style={[
            styles.railDot,
            {backgroundColor: done ? accent : 'rgba(255,255,255,0.85)'},
            done ? {shadowColor: accent, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 3} : shadow.rest,
          ]}>
          <Icon name={done ? 'check' : icon} size={20} color={done ? '#fff' : accent} />
        </View>
        {!isLast && <View style={styles.railLine} />}
      </View>
      {/* contenido */}
      <View style={{flex: 1, paddingBottom: isLast ? 4 : 18}}>
        <Text style={[styles.stationTime, {color: accent}]}>{time.toUpperCase()}</Text>
        <CloudCard>
          <Text style={styles.stationTitle}>{title}</Text>
          {children ? <View style={{marginTop: 9}}>{children}</View> : null}
        </CloudCard>
      </View>
    </View>
  );
}

// ─── Enlace con flecha/check (acciones dentro de tarjetas) ──────
export function LinkAction({
  label,
  icon = 'check',
  color = colors.roseInk,
  onPress,
  testID,
}: {
  label: string;
  icon?: IconName;
  color?: string;
  onPress?: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({pressed}) => [styles.linkAction, pressed && {opacity: 0.6}]}>
      <Text style={[styles.linkText, {color}]}>{label}</Text>
      <Icon name={icon} size={15} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: radius.lg,
    padding: space.xl,
    ...shadow.rest,
  },
  pressed: {opacity: 0.85, transform: [{scale: 0.985}]},

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: 8,
  },
  btnText: {fontFamily: font.body, fontWeight: '600'},

  iconBtn: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...shadow.rest,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerSide: {minWidth: 40, justifyContent: 'center'},
  headerTitle: {
    fontFamily: font.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.earth,
  },

  station: {flexDirection: 'row', gap: 14},
  rail: {alignItems: 'center', width: 44},
  railDot: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  railLine: {flex: 1, width: 2, minHeight: 20, marginTop: 4, backgroundColor: 'rgba(150,180,205,0.35)'},
  stationTime: {
    fontFamily: font.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 7,
  },
  stationTitle: {fontFamily: font.display, fontSize: 22, fontWeight: '500', color: colors.ink, lineHeight: 26},

  linkAction: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start'},
  linkText: {fontFamily: font.body, fontSize: 14, fontWeight: '700'},
});

const sizeStyles: Record<Size, {btn: ViewStyle; text: TextStyle}> = {
  lg: {btn: {paddingVertical: 16, paddingHorizontal: 28}, text: {fontSize: 16}},
  md: {btn: {paddingVertical: 12, paddingHorizontal: 22}, text: {fontSize: 15}},
  sm: {btn: {paddingVertical: 9, paddingHorizontal: 16}, text: {fontSize: 13}},
};

const variantStyles: Record<Variant, {btn: ViewStyle; text: TextStyle}> = {
  primary: {
    btn: {backgroundColor: colors.skyDeep, shadowColor: colors.skyDeep, shadowOpacity: 0.34, shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 5},
    text: {color: '#fff'},
  },
  soft: {
    btn: {backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: colors.border},
    text: {color: colors.inkSoft},
  },
  ghost: {btn: {backgroundColor: 'transparent'}, text: {color: colors.earth}},
  leaf: {
    btn: {backgroundColor: colors.leaf, shadowColor: colors.leaf, shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 5},
    text: {color: '#fff'},
  },
};
