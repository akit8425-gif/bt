import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";

export default function ChatScreen({ route, navigation }) {
  const { device, deviceName, deviceAddress } = route.params;

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await device.write(message + "\n");

      setChat(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: message,
          type: "sent",
        },
      ]);

      setMessage("");
    } catch (error) {
      Alert.alert("Send Error", String(error?.message || error));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

  
   

        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>👤</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{deviceName}</Text>
          <Text style={styles.status}>Connected • {deviceAddress}</Text>
        </View>
      </View>

      <FlatList
        data={chat}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{item.text}</Text>
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

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B12",
    padding: 16,
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
},

btnText: {
  color: "#03120A",
  fontSize: 17,
  fontWeight: "800",
},
  header: {
    marginTop: 42,
    backgroundColor: "#0B1622",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    color: "#fff",
    fontSize: 34,
    marginRight: 10,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#122D22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileText: {
    fontSize: 23,
  },
  deviceName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  status: {
    color: "#00E676",
    fontSize: 12,
    marginTop: 3,
  },
  chatList: {
    paddingVertical: 18,
    flexGrow: 1,
  },
  messageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#00E676",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "80%",
  },
  messageText: {
    color: "#04110A",
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1622",
    padding: 10,
    borderRadius: 24,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#050B12",
    color: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#00E676",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
  },
  sendText: {
    color: "#04110A",
    fontWeight: "800",
  },
});