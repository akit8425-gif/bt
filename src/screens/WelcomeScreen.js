import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050B12" />

      <View style={styles.ringOuter}>
        <View style={styles.ringMiddle}>
          <View style={styles.ringInner}>
            <Text style={styles.icon}>📡</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Mesh Connect</Text>
      <Text style={styles.subtitle}>Stay Connected{"\n"}Without Internet</Text>

      <Text style={styles.desc}>
        Send messages using offline mesh network.{"\n"}
        Works in disaster & no signal zones.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Bluetooth")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B12",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ringOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#00E67633",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  ringMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#00E67655",
    justifyContent: "center",
    alignItems: "center",
  },
  ringInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#00E676",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#00E676",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  desc: {
    color: "#AAB3C2",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#00E676",
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 30,
  },
  buttonText: {
    color: "#04110A",
    fontWeight: "800",
    fontSize: 16,
  },
});