import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

export default function MapScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Live Mesh Map</Text>
            <Text style={styles.subtitle}>Bluetooth relay network topology</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Network Status</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Devices</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Relay Path</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Live</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>Mesh Topology Graph</Text>

          <View style={styles.graphArea}>
            <View style={[styles.line, styles.lineOne]} />
            <View style={[styles.line, styles.lineTwo]} />
            <View style={[styles.line, styles.lineThree]} />
            <View style={[styles.line, styles.lineFour]} />

            <Animated.View
              style={[
                styles.centerPulse,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.radarCircle,
                {
                  transform: [{ rotate }],
                },
              ]}
            />

            <View style={[styles.node, styles.centerNode]}>
              <Text style={styles.nodeIcon}>📱</Text>
              <Text style={styles.nodeText}>You</Text>
            </View>

            <View style={[styles.node, styles.nodeTop]}>
              <Text style={styles.nodeIcon}>📡</Text>
              <Text style={styles.nodeText}>D1</Text>
            </View>

            <View style={[styles.node, styles.nodeLeft]}>
              <Text style={styles.nodeIcon}>📶</Text>
              <Text style={styles.nodeText}>D2</Text>
            </View>

            <View style={[styles.node, styles.nodeRight]}>
              <Text style={styles.nodeIcon}>📶</Text>
              <Text style={styles.nodeText}>D3</Text>
            </View>

            <View style={[styles.node, styles.nodeBottom]}>
              <Text style={styles.nodeIcon}>🚨</Text>
              <Text style={styles.nodeText}>SOS</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Relay Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Device</Text>
            <Text style={styles.infoValue}>Main Node</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Message Route</Text>
            <Text style={styles.infoValue}>You → D1 → D3</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency Mode</Text>
            <Text style={styles.infoValueGreen}>Active</Text>
          </View>
        </View>

        <View style={styles.sosCard}>
          <Text style={styles.sosTitle}>SOS Location</Text>
          <Text style={styles.sosText}>
            Last emergency alert can be shown here with device name, time and
            location information.
          </Text>

          <TouchableOpacity style={styles.sosButton}>
            <Text style={styles.sosButtonText}>View SOS Route</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD = "#0F172A";
const BG = "#020617";
const GREEN = "#22C55E";
const TEXT = "#FFFFFF";
const SUB = "#94A3B8";
const BORDER = "#1E293B";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    marginBottom: 18,
  },

  back: {
    color: TEXT,
    fontSize: 32,
    fontWeight: "bold",
  },

  title: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: SUB,
    fontSize: 13,
    marginTop: 3,
  },

  statusCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },

  statusTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statBox: {
    width: "31%",
    backgroundColor: "#07111F",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  statNumber: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "800",
  },

  statLabel: {
    color: SUB,
    fontSize: 12,
    marginTop: 4,
  },

  mapCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },

  mapTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  graphArea: {
    width: "100%",
    height: 360,
    backgroundColor: "#07111F",
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: BORDER,
  },

  centerPulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34,197,94,0.12)",
    left: width / 2 - 76,
    top: 120,
  },

  radarCircle: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
    left: width / 2 - 121,
    top: 75,
  },

  node: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  centerNode: {
    left: width / 2 - 53,
    top: 145,
    backgroundColor: "#064E3B",
  },

  nodeTop: {
    left: width / 2 - 53,
    top: 35,
  },

  nodeLeft: {
    left: 25,
    top: 150,
  },

  nodeRight: {
    right: 25,
    top: 150,
  },

  nodeBottom: {
    left: width / 2 - 53,
    bottom: 30,
    borderColor: "#EF4444",
  },

  nodeIcon: {
    fontSize: 24,
  },

  nodeText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  line: {
    position: "absolute",
    height: 2,
    backgroundColor: "rgba(34,197,94,0.55)",
  },

  lineOne: {
    width: 95,
    left: width / 2 - 65,
    top: 118,
    transform: [{ rotate: "90deg" }],
  },

  lineTwo: {
    width: 105,
    left: 88,
    top: 186,
    transform: [{ rotate: "-20deg" }],
  },

  lineThree: {
    width: 105,
    right: 88,
    top: 186,
    transform: [{ rotate: "20deg" }],
  },

  lineFour: {
    width: 100,
    left: width / 2 - 65,
    top: 255,
    transform: [{ rotate: "90deg" }],
    backgroundColor: "rgba(239,68,68,0.65)",
  },

  infoCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },

  infoTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 11,
  },

  infoLabel: {
    color: SUB,
    fontSize: 14,
  },

  infoValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },

  infoValueGreen: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
  },

  sosCard: {
    backgroundColor: "#1F1111",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#7F1D1D",
    marginBottom: 30,
  },

  sosTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  sosText: {
    color: "#FECACA",
    fontSize: 14,
    lineHeight: 21,
  },

  sosButton: {
    marginTop: 14,
    backgroundColor: "#EF4444",
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});