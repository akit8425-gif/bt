import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import GetLocation from "react-native-get-location";

const HEARTBEAT_INTERVAL = 5000;
const DEAD_TIMEOUT = 30000;

export default function BluetoothScreen({ navigation }) {
  const { colors } = useTheme();

  const [devices, setDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const subscriptionsRef = useRef({});
  const connectedDevicesRef = useRef([]);
  const savedDevicesRef = useRef({});
  const lastSeenRef = useRef({});
  const seenMessagesRef = useRef(new Set());
  const heartbeatRef = useRef(null);
  const receiveLoopRef = useRef(false);

  useEffect(() => {
    connectedDevicesRef.current = connectedDevices;
  }, [connectedDevices]);

  useEffect(() => {
    return () => {
      receiveLoopRef.current = false;
      Object.values(subscriptionsRef.current).forEach((sub) =>
        sub?.remove?.()
      );
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

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
        (permission) =>
          result[permission] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.log("PERMISSION ERROR:", error);
      return false;
    }
  };

  const prepareBluetooth = async () => {
    const hasPermission = await requestPermissions();

    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Bluetooth aur Location permission allow karo."
      );
      return false;
    }

    const enabled = await RNBluetoothClassic.isBluetoothEnabled();

    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }

    return true;
  };

  const addConnectedDevice = (device) => {
    if (!device?.address) return;

    savedDevicesRef.current[device.address] = device;
    lastSeenRef.current[device.address] = Date.now();

    setSelectedDevice((prev) => prev || device);

    setConnectedDevices((prev) => {
      const exists = prev.find((d) => d.address === device.address);
      if (exists) return prev;
      return [...prev, device];
    });
  };

  const removeConnectedDevice = (address) => {
    subscriptionsRef.current[address]?.remove?.();
    delete subscriptionsRef.current[address];
    delete savedDevicesRef.current[address];
    delete lastSeenRef.current[address];

    setConnectedDevices((prev) => {
      const updated = prev.filter((d) => d.address !== address);

      setSelectedDevice((current) => {
        if (current?.address === address) {
          return updated[0] || null;
        }
        return current;
      });

      return updated;
    });
  };

  const sendToDevice = async (device, packet) => {
    try {
      if (!device?.address) return false;

      const isConnected = await device.isConnected();

      if (!isConnected) return false;

      await device.write(JSON.stringify(packet) + "\n");

      lastSeenRef.current[device.address] = Date.now();
      savedDevicesRef.current[device.address] = device;

      return true;
    } catch (error) {
      console.log("SEND ERROR:", error);
      return false;
    }
  };

  const relayPacket = async (packet, senderAddress) => {
    const targets = connectedDevicesRef.current.filter(
      (d) => d.address !== senderAddress
    );

    for (const device of targets) {
      await sendToDevice(device, packet);
    }
  };

  const handleIncomingMessage = async (rawMessage, senderDevice) => {
    try {
      const packet = JSON.parse(rawMessage);

      if (senderDevice?.address) {
        lastSeenRef.current[senderDevice.address] = Date.now();
      }

      if (packet.type === "PING") {
        await sendToDevice(senderDevice, {
          id: `pong-${Date.now()}-${Math.random()}`,
          type: "PONG",
          from: "Me",
          time: Date.now(),
        });
        return;
      }

      if (packet.type === "PONG") return;

      if (packet.type === "ACK") {
        console.log("DELIVERY CONFIRMED:", packet.ackId);
        return;
      }

      if (!packet.id || !packet.text) return;

      if (seenMessagesRef.current.has(packet.id)) return;

      seenMessagesRef.current.add(packet.id);

      setChat((prev) => [
        ...prev,
        {
          id: packet.id,
          text: `[FROM ${packet.from || "Unknown"}] ${packet.text}`,
          type: "received",
        },
      ]);

      await sendToDevice(senderDevice, {
        id: `ack-${Date.now()}-${Math.random()}`,
        type: "ACK",
        ackId: packet.id,
        from: "Receiver",
        text: "DELIVERED",
      });

      if (packet.relay !== false) {
        await relayPacket(packet, senderDevice?.address);
      }
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          id: `raw-${Date.now()}-${Math.random()}`,
          text: rawMessage,
          type: "received",
        },
      ]);
    }
  };

  const startReadingMessages = (device) => {
    try {
      if (!device?.address) return;

      if (subscriptionsRef.current[device.address]) {
        subscriptionsRef.current[device.address]?.remove?.();
      }

      subscriptionsRef.current[device.address] = device.onDataReceived(
        (event) => {
          const data = event?.data;
          if (!data) return;

          data
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((msg) => handleIncomingMessage(msg, device));
        }
      );
    } catch (error) {
      console.log("READ ERROR:", error);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    heartbeatRef.current = setInterval(async () => {
      const now = Date.now();

      for (const device of connectedDevicesRef.current) {
        try {
          const isConnected = await device.isConnected();
          const lastSeen = lastSeenRef.current[device.address] || 0;

          if (!isConnected || now - lastSeen > DEAD_TIMEOUT) {
            removeConnectedDevice(device.address);
            continue;
          }

          await sendToDevice(device, {
            id: `ping-${Date.now()}-${Math.random()}`,
            type: "PING",
            from: "Me",
            time: Date.now(),
          });
        } catch (error) {
          removeConnectedDevice(device.address);
        }
      }
    }, HEARTBEAT_INTERVAL);
  };

  const startReceiveMode = async () => {
    try {
      const ready = await prepareBluetooth();
      if (!ready) return;

      if (receiveLoopRef.current) {
        Alert.alert("Already Running", "Receive mode already ON hai.");
        return;
      }

      receiveLoopRef.current = true;
      setReceiving(true);

      Alert.alert("Receive Mode ON", "Ab naye devices connect ho sakte hain.");

      while (receiveLoopRef.current) {
        let device = null;

        try {
          device = await RNBluetoothClassic.accept({
            delimiter: "\n",
            secureSocket: true,
            timeout: 120000,
          });
        } catch (e) {
          console.log("SECURE ACCEPT FAILED:", e);
        }

        if (!device) {
          try {
            device = await RNBluetoothClassic.accept({
              delimiter: "\n",
              secureSocket: false,
              timeout: 120000,
            });
          } catch (e) {
            console.log("INSECURE ACCEPT FAILED:", e);
          }
        }

        if (device?.address) {
          addConnectedDevice(device);
          startReadingMessages(device);
          startHeartbeat();
        }
      }
    } catch (error) {
      Alert.alert("Receive Error", String(error?.message || error));
    } finally {
      setReceiving(false);
    }
  };

  const stopReceiveMode = () => {
    receiveLoopRef.current = false;
    setReceiving(false);
    Alert.alert("Receive Mode OFF", "Naye devices accept hona band ho jayega.");
  };

  const startScan = async () => {
    try {
      const ready = await prepareBluetooth();
      if (!ready) return;

      setScanning(true);

      const bonded = await RNBluetoothClassic.getBondedDevices();

      let discovered = [];
      try {
        discovered = await RNBluetoothClassic.startDiscovery();
      } catch (e) {
        console.log("DISCOVERY ERROR:", e);
      }

      const allDevices = [...bonded, ...discovered];

      const uniqueDevices = allDevices.filter(
        (device, index, self) =>
          device?.address &&
          index === self.findIndex((d) => d.address === device.address)
      );

      setDevices(uniqueDevices);
      setScanning(false);
    } catch (error) {
      setScanning(false);
      Alert.alert("Bluetooth Error", String(error?.message || error));
    }
  };

  const connectDevice = async (device) => {
    try {
      if (!device?.address) return;

      const alreadyConnected = connectedDevicesRef.current.some(
        (d) => d.address === device.address
      );

      if (alreadyConnected) {
        setSelectedDevice(device);
        Alert.alert(
          "Already Connected",
          `${device.name || "Device"} already connected hai.`
        );
        return;
      }

      let connected = false;

      try {
        connected = await device.connect({
          delimiter: "\n",
          secureSocket: true,
        });
      } catch (e) {
        console.log("SECURE CONNECT FAILED:", e);
      }

      if (!connected) {
        try {
          connected = await device.connect({
            delimiter: "\n",
            secureSocket: false,
          });
        } catch (e) {
          console.log("INSECURE CONNECT FAILED:", e);
        }
      }

      if (!connected) {
        Alert.alert("Connection Failed", "Device connect nahi hua.");
        return;
      }

      addConnectedDevice(device);
      startReadingMessages(device);
      startHeartbeat();

      Alert.alert(
        "Connected",
        `${device.name || "Device"} connected successfully.`
      );
    } catch (error) {
      Alert.alert("Connect Error", String(error?.message || error));
    }
  };

  const sendSingleMessage = async () => {
    if (!selectedDevice) {
      Alert.alert("No Device", "Pehle kisi connected device ko select karo.");
      return;
    }

    if (!message.trim()) return;

    const packet = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: "MESSAGE",
      from: "Me",
      text: message.trim(),
      relay: false,
      time: Date.now(),
    };

    seenMessagesRef.current.add(packet.id);

    const ok = await sendToDevice(selectedDevice, packet);

    if (!ok) {
      Alert.alert("Send Failed", "Selected device connected nahi hai.");
      return;
    }

    setChat((prev) => [
      ...prev,
      {
        id: packet.id,
        text: `[SENT TO ${selectedDevice.name || "Device"}] ${packet.text}`,
        type: "sent",
      },
    ]);

    setMessage("");
  };

  const sendBroadcastMessage = async () => {
    if (!message.trim()) return;

    const targets = connectedDevicesRef.current;

    if (targets.length === 0) {
      Alert.alert("No Relay Devices", "Pehle ek ya zyada devices connect karo.");
      return;
    }

    const packet = {
      id: `broadcast-${Date.now()}-${Math.random()}`,
      type: "BROADCAST",
      from: "Me",
      text: message.trim(),
      relay: true,
      time: Date.now(),
    };

    seenMessagesRef.current.add(packet.id);

    let successCount = 0;

    for (const device of targets) {
      const ok = await sendToDevice(device, packet);
      if (ok) successCount++;
    }

    setChat((prev) => [
      ...prev,
      {
        id: packet.id,
        text: `[BROADCAST ${successCount}/${targets.length}] ${packet.text}`,
        type: "sent",
      },
    ]);

    setMessage("");
  };

  const sendSOSMessage = async () => {
    const targets = connectedDevicesRef.current;

    if (targets.length === 0) {
      Alert.alert("No Device", "Pehle Bluetooth device connect karo.");
      return;
    }

    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
      });

      const sosText = `SOS ALERT | Help needed | Lat:${location.latitude} | Lng:${location.longitude}`;

      const packet = {
        id: `sos-${Date.now()}-${Math.random()}`,
        type: "SOS",
        from: "Me",
        text: sosText,
        relay: true,
        time: Date.now(),
      };

      seenMessagesRef.current.add(packet.id);

      let successCount = 0;

      for (const device of targets) {
        const ok = await sendToDevice(device, packet);
        if (ok) successCount++;
      }

      setChat((prev) => [
        ...prev,
        {
          id: packet.id,
          text: `[SOS ${successCount}/${targets.length}] ${sosText}`,
          type: "sent",
        },
      ]);

      Alert.alert(
        "SOS Sent",
        `SOS ${successCount}/${targets.length} devices par send hua.`
      );
    } catch (error) {
      Alert.alert(
        "Location Error",
        "GPS ON karo aur location permission allow karo."
      );
    }
  };

  const renderDevice = ({ item }) => {
    const isConnected = connectedDevices.some(
      (d) => d.address === item.address
    );
    const isSelected = selectedDevice?.address === item.address;

    return (
      <View
        style={[
          styles.deviceCard,
          {
            backgroundColor: isSelected ? colors.input : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            shadowColor: colors.glow,
          },
        ]}
      >
        <View
          style={[
            styles.deviceIconBox,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.deviceIcon, { color: colors.primary }]}>BT</Text>
        </View>

        <TouchableOpacity
          style={styles.deviceInfo}
          onPress={() => {
            if (isConnected) setSelectedDevice(item);
          }}
        >
          <Text style={[styles.name, { color: colors.text }]}>
            {item.name || "Unknown Device"}
          </Text>

          <Text style={[styles.address, { color: colors.subText }]}>
            {item.address || "No Address"}
          </Text>

          <Text
            style={[
              styles.statusText,
              {
                color: isConnected ? colors.primary : colors.danger,
              },
            ]}
          >
            {isConnected ? "Connected / Relay Ready" : "Not Connected"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.connectBtn,
            {
              backgroundColor: isConnected ? colors.input : colors.primary,
              borderColor: colors.primary,
              opacity: isConnected ? 0.7 : 1,
            },
          ]}
          onPress={() => connectDevice(item)}
          disabled={isConnected}
        >
          <Text
            style={[
              styles.connectBtnText,
              {
                color: isConnected ? colors.subText : colors.bg,
              },
            ]}
          >
            {isConnected ? "Linked" : "Link"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConnectedDevice = ({ item }) => {
    const isSelected = selectedDevice?.address === item.address;

    return (
      <TouchableOpacity
        style={[
          styles.connectedChip,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.glow : colors.border,
          },
        ]}
        onPress={() => setSelectedDevice(item)}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: isSelected ? colors.bg : colors.text,
            },
          ]}
        >
          {item.name || "Device"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
        },
      ]}
    >
      <View
        style={[
          styles.glowOne,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />

      <View
        style={[
          styles.glowTwo,
          {
            backgroundColor: colors.glow,
          },
        ]}
      />

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.glow,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.appLabel, { color: colors.primary }]}>
            OFFLINE BLUETOOTH MESH
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>
            Mesh Relay
          </Text>

          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Secure device-to-device communication
          </Text>
        </View>

        <View
          style={[
            styles.nodeBox,
            {
              backgroundColor: colors.input,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.nodeCount, { color: colors.primary }]}>
            {connectedDevices.length}
          </Text>
          <Text style={[styles.nodeText, { color: colors.subText }]}>
            Nodes
          </Text>
        </View>
      </View>

      <View style={styles.actionPanel}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: receiving ? colors.danger : colors.primary,
              borderColor: receiving ? colors.danger : colors.primary,
            },
          ]}
          onPress={receiving ? stopReceiveMode : startReceiveMode}
        >
          <Text style={[styles.actionText, { color: colors.bg }]}>
            {receiving ? "Stop Receive" : "Receive Mode"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary,
              opacity: scanning ? 0.55 : 1,
            },
          ]}
          onPress={startScan}
          disabled={scanning}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>
            {scanning ? "Scanning..." : "Scan New"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Active Relay Nodes
        </Text>
        <Text style={[styles.sectionMeta, { color: colors.subText }]}>
          {connectedDevices.length} online
        </Text>
      </View>

      <FlatList
        data={connectedDevices}
        horizontal
        keyExtractor={(item, index) => item.address || String(index)}
        renderItem={renderConnectedDevice}
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        ListEmptyComponent={
          <Text style={[styles.emptySmall, { color: colors.subText }]}>
            No active relay device
          </Text>
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Devices
        </Text>
        <Text style={[styles.sectionMeta, { color: colors.subText }]}>
          Bluetooth scan
        </Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item, index) => item.address || String(index)}
        renderItem={renderDevice}
        style={styles.deviceList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.empty, { color: colors.subText }]}>
              Scan karo, devices yaha show honge.
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[
          styles.sosBtn,
          {
            backgroundColor: colors.danger,
            borderColor: colors.danger,
          },
        ]}
        onPress={sendSOSMessage}
      >
        <Text style={styles.sosText}>SOS Broadcast Location</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.chatBox,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.glow,
          },
        ]}
      >
        <View style={styles.chatHeader}>
          <View>
            <Text style={[styles.chatTitle, { color: colors.text }]}>
              Secure Chat
            </Text>
            <Text style={[styles.connectedText, { color: colors.primary }]}>
              {selectedDevice
                ? `Selected: ${selectedDevice.name || "Device"}`
                : "No selected device"}
            </Text>
          </View>

          <View
            style={[
              styles.chatBadge,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.chatBadgeText, { color: colors.primary }]}>
              {chat.length}
            </Text>
          </View>
        </View>

        <FlatList
          data={chat}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                {
                  backgroundColor:
                    item.type === "received" ? colors.input : colors.primary,
                  alignSelf:
                    item.type === "received" ? "flex-start" : "flex-end",
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color:
                      item.type === "received" ? colors.text : colors.bg,
                  },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyChat, { color: colors.subText }]}>
              No messages yet
            </Text>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Type message..."
            placeholderTextColor={colors.subText}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={sendSingleMessage}
          >
            <Text style={[styles.sendText, { color: colors.bg }]}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.broadcastBtn,
              {
                backgroundColor: colors.input,
                borderColor: colors.primary,
              },
            ]}
            onPress={sendBroadcastMessage}
          >
            <Text style={[styles.broadcastText, { color: colors.text }]}>
              All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomNavWrapper}>
        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.glow,
            },
          ]}
        >
          <TouchableOpacity style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.primary }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Map")}
          >
            <Text style={[styles.navText, { color: colors.subText }]}>
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={[styles.navText, { color: colors.subText }]}>
              Ai
            </Text>
          </TouchableOpacity>
           <TouchableOpacity style={styles.navItem}
            onPress={() => navigation.navigate("About")}>
            <Text style={[styles.navText, { color: colors.subText }]}>
              About Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={[styles.navText, { color: colors.subText }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const shadow3D = {
  elevation: 14,
  shadowOpacity: 0.35,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 95,
    overflow: "hidden",
  },

  glowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.12,
    top: -90,
    right: -80,
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.1,
    bottom: 150,
    left: -100,
  },

  headerCard: {
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow3D,
  },

  appLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  title: {
    fontSize: 31,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },

  nodeBox: {
    width: 74,
    height: 74,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  nodeCount: {
    fontSize: 25,
    fontWeight: "900",
  },

  nodeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  actionPanel: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...shadow3D,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
  },

  sectionMeta: {
    fontSize: 11,
    fontWeight: "800",
  },

  chipList: {
    maxHeight: 48,
    marginBottom: 8,
  },

  connectedChip: {
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  chipText: {
    fontWeight: "900",
    fontSize: 12,
  },

  deviceList: {
    maxHeight: 205,
    marginBottom: 8,
  },

  deviceCard: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    ...shadow3D,
  },

  deviceIconBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  deviceIcon: {
    fontSize: 13,
    fontWeight: "900",
  },

  deviceInfo: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "900",
  },

  address: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "700",
  },

  statusText: {
    fontWeight: "900",
    marginTop: 6,
    fontSize: 12,
  },

  connectBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
  },

  connectBtnText: {
    fontWeight: "900",
    fontSize: 12,
  },

  emptyCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    fontWeight: "800",
  },

  emptySmall: {
    fontWeight: "800",
    marginBottom: 10,
  },

  sosBtn: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    ...shadow3D,
  },

  sosText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  chatBox: {
    borderRadius: 30,
    padding: 14,
    flex: 1,
    borderWidth: 1,
    ...shadow3D,
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  chatTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  connectedText: {
    fontWeight: "800",
    fontSize: 12,
    marginTop: 3,
  },

  chatBadge: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  chatBadgeText: {
    fontWeight: "900",
  },

  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 9,
    maxWidth: "82%",
  },

  messageText: {
    fontWeight: "800",
    fontSize: 13,
  },

  emptyChat: {
    textAlign: "center",
    marginTop: 35,
    fontWeight: "800",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },

  input: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontWeight: "700",
  },

  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },

  sendText: {
    fontWeight: "900",
  },

  broadcastBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
  },

  broadcastText: {
    fontWeight: "900",
  },

  bottomNavWrapper: {
    position: "absolute",
    bottom: 15,
    left: 18,
    right: 18,
  },

  bottomNav: {
    height: 68,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    elevation: 24,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },

  navText: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "900",
  },
});