import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useTheme();

  const [showOverview, setShowOverview] = useState(false);
  const [showMentor, setShowMentor] = useState(false);
  const [showObjective, setShowObjective] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.glowOne, { backgroundColor: colors.primary }]} />
      <View style={[styles.glowTwo, { backgroundColor: colors.glow }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
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
          <Text style={[styles.appLabel, { color: colors.primary }]}>
            OFFLINE COMMUNICATION SYSTEM
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>About Us</Text>

          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Bluetooth Mesh Relay Communication Project
          </Text>
        </View>

        {/* PROJECT OVERVIEW */}
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
            Project Overview
          </Text>

          <Text
            style={[styles.description, { color: colors.subText }]}
            numberOfLines={showOverview ? 0 : 4}
          >
            Bluetooth Mesh Relay App is an offline communication system designed
            to enable secure device-to-device messaging using Bluetooth
            technology without requiring an internet connection. The main
            objective of this project is to provide reliable communication
            between nearby devices in low-network or no-network environments.
            {"\n\n"}
            The application allows users to scan nearby Bluetooth devices,
            establish connections, send personal messages, broadcast messages to
            multiple devices, and share emergency SOS alerts with location
            information. Using mesh relay communication, connected devices can
            forward messages to other nearby devices, helping extend
            communication coverage and improve message delivery.
            {"\n\n"}
            This project is developed using React Native and Bluetooth Classic
            technology as a college-level application focused on offline
            networking, emergency communication, and secure local connectivity.
            The system can be useful in disaster situations, remote areas, and
            environments where internet access is unavailable or unstable.
          </Text>

          <TouchableOpacity
            style={[styles.readMoreBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowOverview(!showOverview)}
          >
            <Text style={[styles.readMoreText, { color: colors.bg }]}>
              {showOverview ? "Read Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* FEATURES */}
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
            Features
          </Text>

          {[
            "Offline Bluetooth Messaging",
            "Mesh Relay Communication",
            "Emergency SOS Broadcast",
            "Real-Time Nearby Device Detection",
            "Secure Local Communication",
            "Connected Nodes Monitoring",
            "Broadcast Message Support",
            "Dark & Neon Theme UI",
            "Live Device Connection System",
            "Multi-Device Relay Support",
          ].map((item, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />

              <Text style={[styles.featureText, { color: colors.subText }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* TECHNOLOGIES */}
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
            Technologies Used
          </Text>

          <View style={styles.techContainer}>
            {[
              "React Native",
              "JavaScript",
              "Bluetooth Classic",
              "Async Storage",
              "Android SDK",
              "Mesh Networking Concepts",
              "Node Relay System",
              "Offline Communication",
              "Ai ENgine Integration",
              "UI/UX Design",
            ].map((tech, index) => (
              <View
                key={index}
                style={[
                  styles.techBadge,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.techText, { color: colors.text }]}>
                  {tech}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* TEAM */}
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
            Team Members
          </Text>

          {[
            "Gaurav Joshi",
            "Kamlesh Bohra",
            "Pardeep Singh",
            "Hitesh Bhatt",
            "Abhishek Tiwari",
          ].map((member, index) => (
            <View
              key={index}
              style={[
                styles.memberCard,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.memberName, { color: colors.text }]}>
                {member}
              </Text>
            </View>
          ))}
        </View>

        {/* DEVELOPERS */}
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
            Developers
          </Text>

          {["Gaurav", "Kamlesh", "Pardeep", "Hitesh"].map((dev, index) => (
            <View
              key={index}
              style={[
                styles.devCard,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.devName, { color: colors.text }]}>
                {dev}
              </Text>

              <Text style={[styles.devRole, { color: colors.subText }]}>
                React Native Developer
              </Text>
            </View>
          ))}
        </View>

        {/* MENTOR */}
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
            Project Mentor
          </Text>

          <Text style={[styles.mentorName, { color: colors.primary }]}>
            Neha Bisht
          </Text>

          <Text
            style={[styles.description, { color: colors.subText }]}
            numberOfLines={showMentor ? 0 : 4}
          >
            Guided and supervised the development of the Bluetooth Mesh Relay
            Communication project. Provided technical guidance, project
            structure, and support during the implementation of offline
            communication and Bluetooth mesh networking concepts.
          </Text>

          <TouchableOpacity
            style={[styles.readMoreBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowMentor(!showMentor)}
          >
            <Text style={[styles.readMoreText, { color: colors.bg }]}>
              {showMentor ? "Read Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* OBJECTIVE */}
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
            Objective
          </Text>

          <Text
            style={[styles.description, { color: colors.subText }]}
            numberOfLines={showObjective ? 0 : 4}
          >
            The main objective of this project is to create an offline emergency
            communication platform capable of transmitting messages between
            nearby devices using Bluetooth mesh relay technology. This system is
            useful in disaster areas, remote locations, and situations where
            internet connectivity is unavailable.
            {"\n\n"}
            The project also focuses on secure local networking, message relay
            systems, emergency broadcasting, and real-time communication between
            connected nodes without relying on cellular or WiFi networks.
          </Text>

          <TouchableOpacity
            style={[styles.readMoreBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowObjective(!showObjective)}
          >
            <Text style={[styles.readMoreText, { color: colors.bg }]}>
              {showObjective ? "Read Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* VERSION */}
        <View
          style={[
            styles.versionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.versionText, { color: colors.text }]}>
            Bluetooth Mesh Relay App
          </Text>

          <Text style={[styles.versionSub, { color: colors.subText }]}>
            Version 1.0.0
          </Text>

          <Text style={[styles.versionSub, { color: colors.primary }]}>
            React Native Based College Project
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowStyle = {
  elevation: 14,
  shadowOpacity: 0.35,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  glowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.12,
    top: -80,
    right: -80,
  },

  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.1,
    bottom: 100,
    left: -100,
  },

  headerCard: {
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    ...shadowStyle,
  },

  appLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    ...shadowStyle,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },

  description: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "600",
  },

  readMoreBtn: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },

  readMoreText: {
    fontWeight: "900",
    fontSize: 13,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },

  featureText: {
    fontSize: 14,
    fontWeight: "700",
  },

  techContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  techBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },

  techText: {
    fontSize: 13,
    fontWeight: "800",
  },

  memberCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },

  memberName: {
    fontSize: 16,
    fontWeight: "900",
  },

  devCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
  },

  devName: {
    fontSize: 17,
    fontWeight: "900",
  },

  devRole: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
  },

  mentorName: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },

  versionCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    alignItems: "center",
    ...shadowStyle,
  },

  versionText: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  versionSub: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
});