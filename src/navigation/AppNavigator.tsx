import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme';

import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/AuthScreen';
import MainTabs from './MainTabs';
import LessonScreen from '../screens/LessonScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatsScreen from '../screens/ChatsScreen';
import StreakScreen from '../screens/StreakScreen';
import DevocionalesScreen from '../screens/DevocionalesScreen';
import SettingsScreen from '../screens/SettingsScreen';
// Los avisos in-app siguen implementados, pero hoy nada los abre: la campana
// del Dashboard se cambió por la rueda de Ajustes (ver DashboardScreen).
// import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.cream,
    text: colors.ink,
    border: colors.border,
    primary: colors.skyDeep,
  },
};

export default function AppNavigator() {
  const {loading, token} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator color={colors.skyDeep} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{headerShown: false, contentStyle: {backgroundColor: colors.cream}}}>
        {!token ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="Conversation" component={ChatScreen} />
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="Streak" component={StreakScreen} />
            <Stack.Screen name="Devocionales" component={DevocionalesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            {/* <Stack.Screen name="Notifications" component={NotificationsScreen} /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
