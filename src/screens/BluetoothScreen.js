import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";

import RNBluetoothClassic from "react-native-bluetooth-classic";

export default function BluetoothScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;

    try {
      const permissions =
        Platform.Version >= 31
          ? [
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]
          : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      const result = await PermissionsAndroid.requestMultiple(permissions);

      return permissions.every(
        permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.log("Permission error:", error);
      return false;
    }
  };

  const enableBluetooth = async () => {
    const enabled = await RNBluetoothClassic.isBluetoothEnabled();

    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }
  };

  const startReceiveMode = async () => {
    try {
      const hasPermission = await requestPermissions();

      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "App Info > Permissions > Nearby devices ko Allow karo."
        );
        return;
      }

      await enableBluetooth();

      setReceiving(true);

      Alert.alert(
        "Receive Mode Started",
        "Ab dusre phone se Scan & Connect karo."
      );

      // TODO: Yaha real Bluetooth server/listen code add hoga.
    } catch (error) {
      setReceiving(false);
      Alert.alert("Receive Error", String(error?.message || error));
    }
  };

  const startScan = async () => {
    try {
      const hasPermission = await requestPermissions();

      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "App Info > Permissions > Nearby devices ko Allow karo."
        );
        return;
      }

      await enableBluetooth();

      setScanning(true);

      const bonded = await RNBluetoothClassic.getBondedDevices();
      const discovered = await RNBluetoothClassic.startDiscovery();

      const allDevices = [...bonded, ...discovered];

      const uniqueDevices = allDevices.filter(
        (device, index, self) =>
          index === self.findIndex(d => d.address === device.address)
      );

      setDevices(uniqueDevices);
    } catch (error) {
      Alert.alert("Bluetooth Error", String(error?.message || error));
    } finally {
      setScanning(false);
    }
  };

  const connectDevice = async device => {
    try {
      const connected = await device.connect();

      if (connected) {
        navigation.navigate("ChatScreen", {
          deviceName: device.name || "Device",
          deviceAddress: device.address,
        });
      } else {
        Alert.alert("Failed", "Device connect nahi hua");
      }
    } catch (error) {
      Alert.alert("Connect Error", String(error?.message || error));
    }
  };

  const renderDevice = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name || "Unknown Device"}</Text>
        <Text style={styles.address}>{item.address || "No address"}</Text>
      </View>

      <TouchableOpacity style={styles.connectBtn} onPress={() => connectDevice(item)}>
        <Text style={styles.connectText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Mesh</Text>

      <TouchableOpacity
        style={[styles.receiveBtn, receiving && styles.disabledBtn]}
        onPress={startReceiveMode}
        disabled={receiving}
      >
        <Text style={styles.mainBtnText}>
          {receiving ? "Receive Mode Active" : "Start Receive Mode"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.disabledBtn]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.mainBtnText}>
          {scanning ? "Scanning..." : "Scan & Connect"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item, index) => item.address || String(index)}
        renderItem={renderDevice}
        ListEmptyComponent={
          <Text style={styles.empty}>Scan karo, devices yaha show honge.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B12",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 45,
    marginBottom: 20,
  },
  receiveBtn: {
    backgroundColor: "#00C853",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 14,
  },
  scanBtn: {
    backgroundColor: "#00E676",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  mainBtnText: {
    color: "#03120A",
    fontSize: 17,
    fontWeight: "800",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: "#0B1622",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  address: {
    color: "#8C95A1",
    fontSize: 12,
    marginTop: 4,
  },
  connectBtn: {
    backgroundColor: "#122D22",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  connectText: {
    color: "#00E676",
    fontWeight: "700",
  },
  empty: {
    color: "#8C95A1",
    textAlign: "center",
    marginTop: 30,
  },
});