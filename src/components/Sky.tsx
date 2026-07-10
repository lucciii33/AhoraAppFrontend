import React from 'react';
import {View, ScrollView, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import {skyGradients} from '../theme';

// Fondo de "cielo": degradado vertical (react-native-svg, sin dependencias
// nativas extra) + nubes decorativas suaves.
function GradientBackground({variant}: {variant: string}) {
  const stops = skyGradients[variant] || skyGradients.day;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          {stops.map((c, i) => (
            <Stop
              key={i}
              offset={i / (stops.length - 1)}
              stopColor={c}
              stopOpacity={1}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" />
    </Svg>
  );
}

function Clouds() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.cloud, {left: '-14%', top: '5%', width: '68%', height: 120}]} />
      <View style={[styles.cloud, {right: '-12%', top: '2%', width: '60%', height: 100, opacity: 0.5}]} />
      <View style={[styles.cloud, {left: '10%', top: '24%', width: '80%', height: 110, opacity: 0.32}]} />
    </View>
  );
}

export function Sky({
  variant = 'day',
  scroll = false,
  clouds = true,
  children,
  contentStyle,
}: {
  variant?: 'dawn' | 'day' | 'soft' | 'reading' | 'night';
  scroll?: boolean;
  clouds?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.root}>
      <GradientBackground variant={variant} />
      {clouds && <Clouds />}
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, overflow: 'hidden'},
  fill: {flex: 1},
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    opacity: 0.7,
  },
});
