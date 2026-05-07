import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProjectIntroScreen from "../screens/ProjectIntroScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import BluetoothScreen from "../screens/BluetoothScreen";
import ChatScreen from "../screens/ChatScreen";
import LocationScreen from "../screens/LocationScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProjectIntro"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#050B12",
        },
      }}
    >
      {/* Intro Screen */}
      <Stack.Screen
        name="ProjectIntro"
        component={ProjectIntroScreen}
      />

      {/* Welcome */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      {/* Bluetooth */}
      <Stack.Screen
        name="BluetoothScreen"
        component={BluetoothScreen}
      />

      {/* Chat */}
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />

      {/* Location */}
      <Stack.Screen
        name="Location"
        component={LocationScreen}
      />
    </Stack.Navigator>
  );
}