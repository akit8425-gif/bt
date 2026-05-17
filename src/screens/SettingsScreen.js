import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  AppState,
  Platform,
  PermissionsAndroid,
  Linking,
} from "react-native";

import RNBluetoothClassic from "react-native-bluetooth-classic";
import { useTheme } from "../context/ThemeContext";

const avatars = ["🧑", "👨‍💻", "🛡️", "🚀"];

export default function SettingsScreen({ navigation }) {
  const {
    theme,
    setTheme,
    colors,
    name,
    setName,
    selectedAvatar,
    setSelectedAvatar,
    saveChat,
    setSaveChat,
    secureMode,
    setSecureMode,
    sosShortcut,
    setSosShortcut,
  } = useTheme();

  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [loadingBluetooth, setLoadingBluetooth] = useState(false);

  useEffect(() => {
    checkBluetoothStatus();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkBluetoothStatus();
      }
    });

    return () => sub.remove();
  }, []);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS !== "android") return true;

    try {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ]);

        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log("Permission error:", error);
      return false;
    }
  };

  const checkBluetoothStatus = async () => {
    try {
      const hasPermission = await requestBluetoothPermissions();

      if (!hasPermission) {
        setBluetoothEnabled(false);
        return;
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setBluetoothEnabled(enabled);
    } catch (error) {
      console.log("Bluetooth status error:", error);
      setBluetoothEnabled(false);
    }
  };

  const toggleBluetooth = async () => {
    try {
      setLoadingBluetooth(true);

      const hasPermission = await requestBluetoothPermissions();

      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Bluetooth use karne ke liye permission allow karo."
        );
        return;
      }

      if (!bluetoothEnabled) {
        await RNBluetoothClassic.requestBluetoothEnabled();

        setTimeout(() => {
          checkBluetoothStatus();
        }, 800);
      } else {
        Alert.alert(
          "Turn Off Bluetooth",
          "Bluetooth OFF karne ke liye settings open karo.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => checkBluetoothStatus(),
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );

        checkBluetoothStatus();
      }
    } catch (error) {
      console.log("Bluetooth toggle error:", error);
      Alert.alert("Error", "Bluetooth ON nahi ho pa raha.");
    } finally {
      setLoadingBluetooth(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Settings
      </Text>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.glow,
          },
        ]}
      >
        <View
          style={[
            styles.avatarGlow,
            {
              borderColor: colors.primary,
              shadowColor: colors.glow,
            },
          ]}
        >
          <Text style={styles.avatarBig}>{selectedAvatar}</Text>
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.subText}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose Avatar
        </Text>

        <View style={styles.avatarRow}>
          {avatars.map((avatar) => (
            <TouchableOpacity
              key={avatar}
              style={[
                styles.avatarBox,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
                selectedAvatar === avatar && {
                  borderColor: colors.primary,
                  backgroundColor: colors.card,
                  shadowColor: colors.glow,
                  shadowOpacity: 0.8,
                  shadowRadius: 16,
                  elevation: 12,
                },
              ]}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Text style={styles.avatarText}>{avatar}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bluetooth */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Bluetooth Control
        </Text>

        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingText, { color: colors.text }]}>
              Bluetooth
            </Text>

            <Text
              style={{
                color: bluetoothEnabled ? colors.primary : "#EF4444",
                fontSize: 12,
                marginTop: 4,
                fontWeight: "800",
              }}
            >
              {bluetoothEnabled ? "ON" : "OFF"}
            </Text>
          </View>

          <Switch
            value={bluetoothEnabled}
            disabled={loadingBluetooth}
            onValueChange={toggleBluetooth}
            trackColor={{
              false: "#334155",
              true: colors.primary,
            }}
            thumbColor={bluetoothEnabled ? "#FFFFFF" : "#CBD5E1"}
          />
        </View>
      </View>

      {/* Theme */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Theme
        </Text>

        <View style={styles.themeRow}>
          {["dark", "neon"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.themeBtn,
                {
                  backgroundColor:
                    theme === item ? colors.primary : colors.input,
                  borderColor:
                    theme === item ? colors.glow : colors.border,
                },
              ]}
              onPress={() => setTheme(item)}
            >
              <Text
                style={[
                  styles.themeText,
                  {
                    color: theme === item ? "#02130A" : colors.text,
                  },
                ]}
              >
                {item === "dark" ? "DARK" : "NEON"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chat */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Chat Settings
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Save Chat History
          </Text>

          <Switch
            value={saveChat}
            onValueChange={setSaveChat}
            trackColor={{
              false: "#334155",
              true: colors.primary,
            }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.dangerBtn,
            {
              borderColor: colors.danger,
            },
          ]}
        >
          <Text style={styles.dangerText}>Clear Chat History</Text>
        </TouchableOpacity>
      </View>

      {/* Security */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security
        </Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            Secure Message Mode
          </Text>

          <Switch
            value={secureMode}
            onValueChange={setSecureMode}
            trackColor={{
              false: "#334155",
              true: colors.primary,
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, { color: colors.text }]}>
            SOS Shortcut
          </Text>

          <Switch
            value={sosShortcut}
            onValueChange={setSosShortcut}
            trackColor={{
              false: "#334155",
              true: colors.primary,
            }}
          />
        </View>
      </View>

      {/* App Info */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Info
        </Text>

        <Text style={[styles.infoText, { color: colors.subText }]}>
          Bluetooth Mesh Relay App
        </Text>

        <Text style={[styles.infoText, { color: colors.subText }]}>
          Version: ClgProject
        </Text>

        <Text style={[styles.infoText, { color: colors.subText }]}>
          Offline secure communication project
        </Text>
      </View>

      {/* THANK YOU BUTTON */}
      <TouchableOpacity
        style={[
          styles.thankYouBtn,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.glow,
          },
        ]}
        onPress={() => navigation.navigate("ProjectIntro")}
      >
        <Text
          style={[
            styles.thankYouText,
            {
              color: colors.bg,
            },
          ]}
        >
          Thank You
        </Text>

        <Text
          style={[
            styles.thankSubText,
            {
              color: colors.bg,
            },
          ]}
        >
         Goodbye B.Tech… See you in the next chapter of life!
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },

  heading: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 20,
    letterSpacing: 1,
  },

  profileCard: {
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1.5,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },

  avatarGlow: {
    width: 110,
    height: 110,
    borderRadius: 40,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 18,
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 18,
  },

  avatarBig: {
    fontSize: 58,
  },

  input: {
    width: "100%",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    borderWidth: 1.5,
    marginBottom: 18,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },

  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  avatarText: {
    fontSize: 30,
  },

  card: {
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1.5,
  },

  themeRow: {
    flexDirection: "row",
    gap: 12,
  },

  themeBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  themeText: {
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  settingText: {
    fontSize: 15,
    fontWeight: "700",
  },

  dangerBtn: {
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1.5,
    backgroundColor: "#2A1010",
  },

  dangerText: {
    color: "#F87171",
    fontWeight: "900",
  },

  infoText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },

  thankYouBtn: {
    marginTop: 8,
    marginBottom: 40,
    borderRadius: 30,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },

  thankYouText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },

  thankSubText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.85,
  },
});