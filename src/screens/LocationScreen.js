import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import Geolocation from "react-native-geolocation-service";

export default function LocationScreen({ navigation }) {
  const [location, setLocation] = useState({
    lat: "--.----",
    lng: "--.----",
  });

  const requestLocationPermission = async () => {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getCurrentLocation = async (type = "location") => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert("Permission Denied", "Location permission required hai");
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        const newLocation = {
          lat: latitude.toFixed(5),
          lng: longitude.toFixed(5),
        };

        setLocation(newLocation);

        const locationData = {
          type,
          lat: latitude,
          lng: longitude,
          time: new Date().toLocaleTimeString(),
        };

        console.log("Location Data:", locationData);

        Alert.alert(
          type === "sos" ? "SOS Location Ready" : "Location Updated",
          `Lat: ${newLocation.lat}\nLng: ${newLocation.lng}`
        );

        // Next step me yaha Bluetooth send hoga:
        // sendMessage(JSON.stringify(locationData));
      },
      error => {
        console.log("Location Error:", error);
        Alert.alert("Error", "Location fetch nahi ho payi");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050B12" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Location Sharing</Text>
        <Text style={styles.headerIcon}>📍</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.bigIcon}>🛰️</Text>
        <Text style={styles.cardTitle}>Offline GPS Location</Text>
        <Text style={styles.cardText}>
          Internet ke bina GPS location Bluetooth se share karo.
        </Text>

        <View style={styles.locationBox}>
          <Text style={styles.label}>Current Location</Text>
          <Text style={styles.coords}>Lat: {location.lat}</Text>
          <Text style={styles.coords}>Lng: {location.lng}</Text>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => getCurrentLocation("location")}
        >
          <Text style={styles.btnText}>📍 Share My Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sosBtn}
          onPress={() => getCurrentLocation("sos")}
        >
          <Text style={styles.btnText}>🚨 Send SOS Location</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Last Received Location</Text>

      <View style={styles.receivedCard}>
        <Text style={styles.receivedTitle}>User_02</Text>
        <Text style={styles.receivedText}>Lat: 29.0745</Text>
        <Text style={styles.receivedText}>Lng: 80.1093</Text>
        <Text style={styles.time}>Received: 10:42 AM</Text>
      </View>

      <Text style={styles.sectionTitle}>Use Cases</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.smallCard}>
          <Text style={styles.smallIcon}>🚑</Text>
          <Text style={styles.smallText}>Rescue</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallIcon}>🧭</Text>
          <Text style={styles.smallText}>Lost Tracking</Text>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.smallIcon}>📡</Text>
          <Text style={styles.smallText}>Offline Share</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B12",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    color: "#fff",
    fontSize: 42,
    marginTop: -6,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  headerIcon: {
    fontSize: 26,
  },
  card: {
    backgroundColor: "#0E1A24",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2D3A",
  },
  bigIcon: {
    fontSize: 58,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
  },
  cardText: {
    color: "#9AA8B6",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  locationBox: {
    width: "100%",
    backgroundColor: "#07111A",
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
  },
  label: {
    color: "#00E676",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "700",
  },
  coords: {
    color: "#DCE7F3",
    fontSize: 16,
    marginTop: 4,
  },
  shareBtn: {
    width: "100%",
    backgroundColor: "#00E676",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  sosBtn: {
    width: "100%",
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#061018",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 12,
  },
  receivedCard: {
    backgroundColor: "#0E1A24",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2D3A",
  },
  receivedTitle: {
    color: "#00E676",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  receivedText: {
    color: "#DCE7F3",
    fontSize: 15,
    marginTop: 3,
  },
  time: {
    color: "#8C95A1",
    fontSize: 13,
    marginTop: 8,
  },
  smallCard: {
    width: 130,
    backgroundColor: "#0E1A24",
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2D3A",
  },
  smallIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  smallText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});