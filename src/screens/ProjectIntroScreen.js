// src/screens/ProjectIntroScreen.js

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  StatusBar,
} from "react-native";

const slides = [
  {
    title: "Bluetooth Chat",
    image: require("../assets/intro/bt1.png"),
    desc: "You can send and receive offline messages between nearby devices without internet.",
  },

  {
    title: "Emergency SOS",
    image: require("../assets/intro/sos1.png"),
    desc: "In emergency situations, you can send SOS alerts to connected devices.",
  },

  {
    title: "Location Sharing",
    image: require("../assets/intro/loc1.png"),
    desc: "Share location details without internet.",
  },

  {
    title: "AI Assistance",
    image: require("../assets/intro/ai1.png"),
    desc: "Future scope will be for iSmart alerts and report generation.",
  },
];

export default function ProjectIntroScreen({ navigation }) {
  const [index, setIndex] = useState(0);

  const cardScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const isLastScreen = index === slides.length - 1;

  // CARD PRESS ANIMATION
  const pressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.985,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  // BUTTON PRESS ANIMATION
  const buttonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const buttonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  // NEXT
  const nextSlide = () => {
    if (!isLastScreen) {
      setIndex(index + 1);
    }
  };

  // BACK
  const prevSlide = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#050B12" barStyle="light-content" />

      {/* LEFT TOUCH */}
      <Pressable
        style={styles.leftTouch}
        onPress={prevSlide}
        onPressIn={pressIn}
        onPressOut={pressOut}
      />

      {/* RIGHT TOUCH */}
      <Pressable
        style={styles.rightTouch}
        onPress={nextSlide}
        onPressIn={pressIn}
        onPressOut={pressOut}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appName}>Mesh Connect</Text>

        <Text style={styles.tagline}>
          Tap Left Side ← Back {"\n"}
          Tap Right Side → Next
        </Text>
      </View>

      {/* CARD */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        {/* IMAGE */}
        <View style={styles.imageBox}>
          <Image source={slides[index].image} style={styles.image} />
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          {slides[index].title}
        </Text>

        {/* DESCRIPTION */}
        <Text style={styles.desc}>
          {slides[index].desc}
        </Text>

        {/* DOTS */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                index === i && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* CONTINUE BUTTON */}
      {isLastScreen && (
        <Pressable
          onPressIn={buttonPressIn}
          onPressOut={buttonPressOut}
          onPress={() => navigation.navigate("BluetoothScreen")}
        >
          <Animated.View
            style={[
              styles.button,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B12",
    paddingHorizontal: 22,
  },

  header: {
    marginTop: 55,
    alignItems: "center",
    zIndex: 10,
  },

  appName: {
    color: "#00E676",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1.2,

    textShadowColor: "rgba(0,230,118,0.45)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 12,
  },

  tagline: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.5,
  },

  /* TOUCH AREAS */
  leftTouch: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 95,
    width: "35%",
    zIndex: 2,
  },

  rightTouch: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 95,
    width: "65%",
    zIndex: 2,
  },

  /* CARD */
  card: {
    flex: 1,
    backgroundColor: "#0D1724",
    marginTop: 35,
    marginBottom: 25,
    borderRadius: 30,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(0,230,118,0.22)",

    shadowColor: "#00E676",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },

  /* IMAGE */
  imageBox: {
    width: "100%",
    height: 265,
    borderRadius: 26,
    backgroundColor: "#07111D",
    overflow: "hidden",

    borderWidth: 1.5,
    borderColor: "rgba(0,230,118,0.4)",

    marginBottom: 30,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* TEXT */
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14,
    textAlign: "center",
  },

  desc: {
    color: "#AAB7C4",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  /* DOTS */
  dots: {
    flexDirection: "row",
    marginTop: 28,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 3,
  },

  activeDot: {
    width: 14,
    height: 5,
    borderRadius: 10,
    backgroundColor: "rgba(0,230,118,0.55)",
  },

  /* BUTTON */
  button: {
    backgroundColor: "#00E676",

    paddingVertical: 16,
    borderRadius: 18,

    alignItems: "center",
    marginBottom: 35,

    shadowColor: "#00E676",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  buttonText: {
    color: "#03140B",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
});