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
} from "react-native";

import RNBluetoothClassic from "react-native-bluetooth-classic";
import GetLocation from "react-native-get-location";

const HEARTBEAT_INTERVAL = 5000; 
const DEAD_TIMEOUT = 35000;

export default function ChatScreen() {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const subscriptionsRef = useRef({});
  const seenMessagesRef = useRef(new Set());
  const heartbeatRef = useRef(null);
  const lastSeenRef = useRef({});
  const devicesRef = useRef([]);

  useEffect(() => {
    devicesRef.current = connectedDevices;
  }, [connectedDevices]);

  useEffect(() => {
    return () => {
      Object.values(subscriptionsRef.current).forEach(sub => {
        if (sub?.remove) sub.remove();
      });

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
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
      console.log("PERMISSION RESULT:", result);

      return permissions.every(
        permission => result[permission] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.log("PERMISSION ERROR:", error);
      return false;
    }
  };

  const prepareBluetooth = async () => {
    const hasPermission = await requestPermissions();

    if (!hasPermission) {
      Alert.alert("Permission Required", "Bluetooth aur Location permission allow karo");
      return false;
    }

    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    console.log("BLUETOOTH ENABLED:", enabled);

    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    }

    return true;
  };

  const addConnectedDevice = device => {
    if (!device?.address) return;

    lastSeenRef.current[device.address] = Date.now();

    setConnectedDevice(device);

    setConnectedDevices(prev => {
      const exists = prev.find(d => d.address === device.address);
      if (exists) return prev;
      return [...prev, device];
    });
  };

  const removeDeadDevice = address => {
    console.log("REMOVING DEAD DEVICE:", address);

    if (subscriptionsRef.current[address]) {
      subscriptionsRef.current[address]?.remove?.();
      delete subscriptionsRef.current[address];
    }

    delete lastSeenRef.current[address];

    setConnectedDevices(prev => {
      const updated = prev.filter(d => d.address !== address);
      setConnectedDevice(updated[0] || null);
      return updated;
    });
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    heartbeatRef.current = setInterval(async () => {
      const now = Date.now();

      for (const device of devicesRef.current) {
        try {
          const isConnected = await device.isConnected();
          const lastSeen = lastSeenRef.current[device.address] || 0;

          console.log("PING CHECK:", {
            device: device.name || device.address,
            isConnected,
            lastSeenAgo: now - lastSeen,
          });

          if (!isConnected || now - lastSeen > DEAD_TIMEOUT) {
            removeDeadDevice(device.address);
            continue;
          }

          const pingPacket = {
            id: `ping-${Date.now()}-${Math.random()}`,
            type: "PING",
            from: "Me",
            time: Date.now(),
          };

          await device.write(JSON.stringify(pingPacket) + "\n");
          console.log("PING SENT:", device.name || device.address);
        } catch (error) {
          console.log("PING ERROR:", error);
          removeDeadDevice(device.address);
        }
      }
    }, HEARTBEAT_INTERVAL);
  };

  const sendToDevice = async (device, packet) => {
    try {
      const isConnected = await device.isConnected();

      if (!isConnected) {
        removeDeadDevice(device.address);
        return false;
      }

      await device.write(JSON.stringify(packet) + "\n");
      return true;
    } catch (error) {
      console.log("SEND TO DEVICE ERROR:", error);
      removeDeadDevice(device.address);
      return false;
    }
  };

  const relayPacket = async (packet, senderAddress) => {
    const targets = devicesRef.current.filter(
      d => d.address !== senderAddress
    );

    if (targets.length === 0) {
      console.log("NO RELAY TARGET FOUND");
      return;
    }

    for (const device of targets) {
      const ok = await sendToDevice(device, packet);
      console.log("RELAY RESULT:", device.name || device.address, ok);
    }
  };

  const handleIncomingMessage = async (rawMessage, senderDevice) => {
    console.log("RAW MESSAGE RECEIVED:", rawMessage);

    try {
      const packet = JSON.parse(rawMessage);

      if (senderDevice?.address) {
        lastSeenRef.current[senderDevice.address] = Date.now();
      }

      if (packet.type === "PING") {
        console.log("PING RECEIVED");

        const pongPacket = {
          id: `pong-${Date.now()}-${Math.random()}`,
          type: "PONG",
          from: "Me",
          time: Date.now(),
        };

        await sendToDevice(senderDevice, pongPacket);
        console.log("PONG SENT");
        return;
      }

      if (packet.type === "PONG") {
        console.log("PONG RECEIVED");
        return;
      }

      if (packet.type === "ACK") {
        console.log("DELIVERY CONFIRMED FOR:", packet.ackId);
        return;
      }

      if (!packet.id || !packet.text) {
        console.log("INVALID PACKET:", packet);
        return;
      }

      if (seenMessagesRef.current.has(packet.id)) {
        console.log("DUPLICATE MESSAGE IGNORED:", packet.id);
        return;
      }

      seenMessagesRef.current.add(packet.id);

      setChat(prev => [
        ...prev,
        {
          id: packet.id,
          text: `[FROM ${packet.from || "Unknown"}] ${packet.text}`,
          type: "received",
        },
      ]);

      const ackPacket = {
        id: `ack-${Date.now()}-${Math.random()}`,
        type: "ACK",
        ackId: packet.id,
        from: "Receiver",
        text: "DELIVERED",
      };

      await sendToDevice(senderDevice, ackPacket);

      if (packet.relay !== false) {
        await relayPacket(packet, senderDevice?.address);
      }
    } catch (error) {
      console.log("MESSAGE PARSE ERROR:", error);
    }
  };

  const startReadingMessages = async device => {
    try {
      if (!device?.address) return;

      console.log("STARTING LISTENER:", device.name || device.address);

      if (subscriptionsRef.current[device.address]) {
        subscriptionsRef.current[device.address]?.remove?.();
      }

      subscriptionsRef.current[device.address] = device.onDataReceived(event => {
        const data = event?.data;

        if (!data) return;

        const messages = data
          .split("\n")
          .map(m => m.trim())
          .filter(Boolean);

        messages.forEach(msg => {
          handleIncomingMessage(msg, device);
        });
      });

      lastSeenRef.current[device.address] = Date.now();
    } catch (error) {
      console.log("READ ERROR:", error);
    }
  };

  const startReceiveMode = async (autoRestart = false) => {
    try {
      if (receiving && !autoRestart) return;

      const ready = await prepareBluetooth();
      if (!ready) return;

      setReceiving(true);

      let device = null;

      try {
        console.log("ACCEPT SECURE...");
        device = await RNBluetoothClassic.accept({
          delimiter: "\n",
          secureSocket: true,
        });
      } catch (e) {
        console.log("SECURE ACCEPT FAILED:", e);
      }

      if (!device) {
        try {
          console.log("ACCEPT INSECURE...");
          device = await RNBluetoothClassic.accept({
            delimiter: "\n",
            secureSocket: false,
          });
        } catch (e) {
          console.log("INSECURE ACCEPT FAILED:", e);
        }
      }

      if (!device) {
        setReceiving(false);
        if (!autoRestart) Alert.alert("Receive Failed", "Koi device connect nahi hua");
        return;
      }

      console.log("RECEIVER CONNECTED:", device.name, device.address);

      addConnectedDevice(device);
      await startReadingMessages(device);
      startHeartbeat();

      setReceiving(false);

      if (!autoRestart) {
        Alert.alert("Connected", `${device.name || "Device"} connected`);
      }
    } catch (error) {
      setReceiving(false);
      console.log("RECEIVE ERROR:", error);

      if (!autoRestart) {
        Alert.alert("Receive Error", String(error?.message || error));
      }
    }
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
          index === self.findIndex(d => d.address === device.address)
      );

      setDevices(uniqueDevices);
      setScanning(false);
    } catch (error) {
      setScanning(false);
      console.log("SCAN ERROR:", error);
      Alert.alert("Bluetooth Error", String(error?.message || error));
    }
  };

  const connectDevice = async device => {
    try {
      console.log("CONNECTING:", device.name, device.address);

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
        Alert.alert("Connection Failed", "Device connect nahi hua");
        return;
      }

      addConnectedDevice(device);
      await startReadingMessages(device);
      startHeartbeat();

      Alert.alert("Connected", `${device.name || "Device"} connected successfully`);
    } catch (error) {
      console.log("CONNECT ERROR:", error);
      Alert.alert("Connect Error", String(error?.message || error));
    }
  };

  const sendSingleMessage = async () => {
    if (!connectedDevice) {
      Alert.alert("No Device", "Connect device first");
      return;
    }

    if (!message.trim()) return;

    const packet = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: "MESSAGE",
      from: "Me",
      text: message.trim(),
      relay: true,
      time: Date.now(),
    };

    seenMessagesRef.current.add(packet.id);

    const ok = await sendToDevice(connectedDevice, packet);

    if (!ok) {
      Alert.alert("Send Failed", "Device disconnected hai");
      return;
    }

    setChat(prev => [
      ...prev,
      {
        id: packet.id,
        text: `[SENT] ${packet.text}`,
        type: "sent",
      },
    ]);

    setMessage("");
  };

  const sendSOSMessage = async () => {
    const targets = devicesRef.current;

    if (targets.length === 0) {
      Alert.alert("No Device", "Connect device first");
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

      setChat(prev => [
        ...prev,
        {
          id: packet.id,
          text: `[SOS SENT ${successCount}/${targets.length}] ${sosText}`,
          type: "sent",
        },
      ]);

      Alert.alert("SOS Sent", `SOS ${successCount} device par send hua`);
    } catch (error) {
      console.log("SOS ERROR:", error);
      Alert.alert("Location Error", "GPS ON karo aur location permission allow karo.");
    }
  };

  const renderDevice = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name || "Unknown Device"}</Text>
        <Text style={styles.address}>{item.address || "No Address"}</Text>
      </View>

      <TouchableOpacity style={styles.connectBtn} onPress={() => connectDevice(item)}>
        <Text style={styles.connectText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Mesh</Text>

      <Text style={styles.status}>
        Active Devices: {connectedDevices.length}
      </Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.receiveBtn, receiving && styles.disabledBtn]}
          onPress={() => startReceiveMode(false)}
          disabled={receiving}
        >
          <Text style={styles.modeText}>
            {receiving ? "Waiting..." : "Receive Mode"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.disabledBtn]}
          onPress={startScan}
          disabled={scanning}
        >
          <Text style={styles.modeText}>
            {scanning ? "Scanning..." : "Send Mode / Scan"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}  
        keyExtractor={(item, index) => item.address || String(index)}
        renderItem={renderDevice}
        ListEmptyComponent={
          <Text style={styles.empty}>Scan, Nearby Goddesses will be showing here.</Text>
        }
      />

      <TouchableOpacity style={styles.sosBtn} onPress={sendSOSMessage}>
        <Text style={styles.sosText}>🚨 SOS / Send Offline Location</Text>
      </TouchableOpacity>

      <View style={styles.chatBox}>
        <Text style={styles.connectedText}>
          {connectedDevice
            ? `Connected: ${connectedDevice.name || "Device"}`
            : "No device connected"}
        </Text>

        <FlatList
          data={chat}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.type === "received" && styles.receivedBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.type === "received" && styles.receivedText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type message..."
            placeholderTextColor="#8C95A1"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendSingleMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 30,
    fontWeight: "900",
    marginTop: 50,
    marginBottom: 8,
  },
  status: {
    color: "#00E676",
    fontWeight: "800",
    marginBottom: 18,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  receiveBtn: {
    flex: 1,
    backgroundColor: "#008236",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  scanBtn: {
    flex: 1,
    backgroundColor: "#075D9C",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  modeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#0B1622",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  address: {
    color: "#8C95A1",
    marginTop: 6,
  },
  connectBtn: {
    backgroundColor: "#063D24",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  connectText: {
    color: "#00E676",
    fontWeight: "900",
  },
  empty: {
    color: "#8C95A1",
    textAlign: "center",
    marginTop: 25,
  },
  sosBtn: {
    backgroundColor: "#FF2D3F",
    padding: 16,
    borderRadius: 28,
    alignItems: "center",
    marginVertical: 14,
  },
  sosText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  chatBox: {
    backgroundColor: "#0B1622",
    borderRadius: 18,
    padding: 12,
    flex: 1,
  },
  connectedText: {
    color: "#00E676",
    fontWeight: "900",
    marginBottom: 10,
    fontSize: 16,
  },
  messageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#00E676",
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    maxWidth: "80%",
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1E293B",
  },
  messageText: {
    color: "#04110A",
    fontWeight: "800",
  },
  receivedText: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#050B12",
    color: "#fff",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendBtn: {
    backgroundColor: "#00E676",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 25,
  },
  sendText: {
    color: "#04110A",
    fontWeight: "900",
  },
});