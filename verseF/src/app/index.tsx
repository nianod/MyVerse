import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

const stories = [
  {
    icon: "✦",
    title: "The breakup",
    copy: "For the version of you who finally chose yourself.",
    tint: "#E8B8AA",
    accent: "#9C4B43",
  },
  {
    icon: "♡",
    title: "Best friends",
    copy: "Inside jokes, voice notes, and growing up together.",
    tint: "#D7C8EC",
    accent: "#604784",
  },
  {
    icon: "⌁",
    title: "Graduation day",
    copy: "All the late nights that led to this one bright morning.",
    tint: "#B9D8CC",
    accent: "#376D5A",
  },
  {
    icon: "↗",
    title: "Big dreams",
    copy: "For the brave, messy middle before it all makes sense.",
    tint: "#F0D49A",
    accent: "#98691D",
  },
  {
    icon: "☼",
    title: "An ordinary Tuesday",
    copy: "Because the small moments are the ones that stay.",
    tint: "#F0C6B8",
    accent: "#A45339",
  },
];

const fragments = [
  "Building at 2AM",
  "University life",
  "Big dreams",
  "Too much coffee",
];

function Waveform({ light = false }: { light?: boolean }) {
  const pulse = useRef(new Animated.Value(0.45)).current;
  const bars = useMemo(
    () => [
      14, 24, 36, 20, 48, 28, 40, 20, 33, 52, 30, 18, 38, 26, 45, 20, 34, 16,
      29, 42, 24, 35, 17, 30,
    ],
    [],
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View className="h-14 flex-row items-center gap-1 overflow-hidden">
      {bars.map((height, index) => (
        <Animated.View
          key={`${height}-${index}`}
          style={{
            height,
            opacity: index < 15 ? pulse : 0.32,
            backgroundColor: light ? "#FFF9F2" : "#332522",
            width: 3,
            borderRadius: 999,
          }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width > 780;
  const scrollViewRef = useRef<ScrollView>(null);
  const examplesOffset = useRef(0);
  const [story, setStory] = useState(
    "I’m 22, building things at 2AM between university classes. I miss home sometimes, drink too much coffee, and I’m convinced the best part of my life is still ahead of me.",
  );
  const [playing, setPlaying] = useState(false);

  const showCreate = () => router.push("/login");

  return (
    <View className="flex-1 bg-[#fcf8f1]">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={styles.grain} pointerEvents="none" />

        <View className="mx-auto w-full max-w-[1180px] px-5 pt-5">
          <View
            className="flex-row items-center justify-between rounded-full border border-[#e8dfd3] bg-[#fffdf9]/90 px-4 py-3"
            style={styles.nav}
          >
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#241a17]">
                <Text className="text-base text-[#f7c86b]">✦</Text>
              </View>
              <Text className="text-xl font-semibold tracking-tight text-[#241a17]">
                MyVerse
              </Text>
            </View>
            {isWide && (
              <View className="flex-row items-center gap-6">
                <Text className="text-sm text-[#6f625c]">How it works</Text>
                <Text className="text-sm text-[#6f625c]">Examples</Text>
                <Text className="text-sm text-[#6f625c]">Log in</Text>
              </View>
            )}
            <Pressable
              onPress={showCreate}
              className="rounded-full bg-[#241a17] px-4 py-2 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-[#fffaf3]">
                Create my song
              </Text>
            </Pressable>
          </View>

          <View
            className="items-center pt-20"
            style={isWide ? styles.heroWide : undefined}
          >
            <View
              style={isWide ? styles.heroCopy : undefined}
              className={isWide ? "items-start" : "items-center"}
            >
              <Text className="mb-5 rounded-full bg-[#f5eadb] px-3 py-2 text-[11px] font-bold tracking-[2px] text-[#9b633b]">
                YOUR STORY, YOUR SOUND
              </Text>
              <Text
                className={`font-semibold tracking-[-2px] text-[#241a17] ${isWide ? "text-left text-6xl leading-[66px]" : "text-center text-5xl leading-[56px]"}`}
              >
                What if your life{`\n`}had a soundtrack?
              </Text>
              <Text
                className={`mt-6 max-w-[510px] text-lg leading-7 text-[#6f625c] ${isWide ? "text-left" : "text-center"}`}
              >
                Tell MyVerse anything about you—your memories, dreams, people,
                and beautiful little chaos. We’ll turn it into an original song
                that sounds like your life.
              </Text>
              <View className="mt-8 flex-row items-center gap-5">
                <Pressable
                  onPress={showCreate}
                  className="rounded-full bg-[#e9764e] px-6 py-4 shadow-sm active:scale-95"
                >
                  <Text className="text-base font-bold text-white">
                    Create my song →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    scrollViewRef.current?.scrollTo({
                      y: examplesOffset.current - 24,
                      animated: true,
                    })
                  }
                  className="flex-row items-center gap-2 py-3 active:opacity-70"
                >
                  <View className="h-7 w-7 items-center justify-center rounded-full border border-[#cfc1b4]">
                    <Text className="ml-0.5 text-[10px] text-[#241a17]">
                      {playing ? "Ⅱ" : "▶"}
                    </Text>
                  </View>
                  <Text className="font-medium text-[#4b3d37]">
                    See an example
                  </Text>
                </Pressable>
              </View>
              <Text className="mt-5 text-xs text-[#9c8d83]">
                Free to start · No musical experience required
              </Text>
            </View>

            <View style={[styles.playerWrap, isWide && styles.playerWide]}>
              <View
                className="overflow-hidden rounded-[30px] bg-[#2d211d] p-4 shadow-2xl"
                style={styles.player}
              >
                <View className="h-[230px] overflow-hidden rounded-[22px] bg-[#c46a50] p-5">
                  <View className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#f4c76c] opacity-90" />
                  <View className="absolute -bottom-16 left-5 h-44 w-44 rounded-full bg-[#8f3d45]" />
                  <View className="absolute bottom-6 right-5 h-24 w-24 rounded-full border-[12px] border-[#efab6d] opacity-80" />
                  <Text className="text-[11px] font-bold tracking-[2px] text-[#fff3e3]">
                    A MYVERSE ORIGINAL
                  </Text>
                  <View className="mt-auto">
                    <Text className="text-3xl font-semibold leading-9 text-[#fff8ef]">
                      Arnold’s{`\n`}Chapter
                    </Text>
                    <Text className="mt-2 text-sm text-[#fff0e0]">
                      a song about becoming
                    </Text>
                  </View>
                </View>
                <View className="px-2 pb-2 pt-4">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-lg font-semibold text-[#fff8ef]">
                        Arnold’s Chapter
                      </Text>
                      <Text className="mt-0.5 text-xs text-[#bfaea6]">
                        Indie pop · 03:24
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setPlaying(!playing)}
                      className="h-11 w-11 items-center justify-center rounded-full bg-[#f5c66b] active:scale-95"
                    >
                      <Text className="ml-0.5 text-sm text-[#31231e]">
                        {playing ? "Ⅱ" : "▶"}
                      </Text>
                    </Pressable>
                  </View>
                  <Waveform light />
                  <View className="h-1.5 overflow-hidden rounded-full bg-[#5e4840]">
                    <View className="h-full w-[48%] rounded-full bg-[#f5c66b]" />
                  </View>
                </View>
              </View>
              {fragments.map((fragment, index) => (
                <View
                  key={fragment}
                  style={[styles.fragment, fragmentPositions[index]]}
                  className="rounded-full border border-[#eadccf] bg-[#fffdf8] px-3 py-2 shadow-sm"
                >
                  <Text className="text-xs font-medium text-[#5f4d43]">
                    {fragment}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-28 rounded-[32px] border border-[#eaded1] bg-[#f4ece1] p-6 md:p-10">
            <Text className="text-4xl font-semibold tracking-tight text-[#241a17]">
              Tell us anything.
            </Text>
            <Text className="mt-3 max-w-[600px] text-base leading-6 text-[#75665e]">
              The more real you are, the more your song feels like home.
            </Text>
            <TextInput
              value={story}
              onChangeText={setStory}
              multiline
              textAlignVertical="top"
              placeholder="Start with a memory…"
              placeholderTextColor="#9e9087"
              className="mt-7 min-h-[140px] rounded-2xl border border-[#e5d6c8] bg-[#fffdf9] p-5 text-base leading-6 text-[#3c2d27]"
            />
            <Pressable
              onPress={showCreate}
              className="mt-4 self-start rounded-full bg-[#241a17] px-5 py-3.5 active:opacity-80"
            >
              <Text className="font-semibold text-[#fffaf3]">
                ✨ Turn this into a song
              </Text>
            </Pressable>
          </View>

          <View
            className="mt-28"
            onLayout={(event) => {
              examplesOffset.current = event.nativeEvent.layout.y;
            }}
          >
            <Text className="text-center text-4xl font-semibold tracking-tight text-[#241a17]">
              Made from moments
            </Text>
            <Text className="mx-auto mt-3 max-w-[470px] text-center text-base leading-6 text-[#75665e]">
              Every chapter has a rhythm. Here are a few ways people have heard
              theirs.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyRow}
              className="mt-10 -mx-5"
            >
              {stories.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={() =>
                    Alert.alert(
                      item.title,
                      "This story is ready to become a song.",
                    )
                  }
                  style={[styles.storyCard, { backgroundColor: item.tint }]}
                  className="overflow-hidden rounded-[24px] p-5 active:scale-[0.98]"
                >
                  <View
                    style={[styles.storyOrb, { backgroundColor: item.accent }]}
                  />
                  <Text className="text-3xl" style={{ color: item.accent }}>
                    {item.icon}
                  </Text>
                  <View className="mt-auto flex-row items-end justify-between">
                    <View className="max-w-[185px]">
                      <Text className="text-xl font-semibold text-[#30221e]">
                        {item.title}
                      </Text>
                      <Text className="mt-2 text-sm leading-5 text-[#5e4c45]">
                        {item.copy}
                      </Text>
                    </View>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#fffaf4]">
                      <Text
                        style={{ color: item.accent }}
                        className="ml-0.5 text-xs"
                      >
                        ▶
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View
            className="mt-28 items-center overflow-hidden rounded-[34px] bg-[#241a17] px-6 py-16"
            style={styles.snapshot}
          >
            <Text className="text-center text-[11px] font-bold tracking-[2px] text-[#f5c66b]">
              MORE THAN A MEMORY
            </Text>
            <Text className="mt-5 max-w-[700px] text-center text-4xl font-semibold leading-[47px] tracking-tight text-[#fff8ef]">
              Not just a song. A snapshot of who you were.
            </Text>
            <Text className="mt-5 max-w-[570px] text-center text-base leading-6 text-[#cabcb3]">
              Come back to the exact hopes, people, and tiny obsessions that
              made each year yours.
            </Text>
            <View className="mt-10 flex-row flex-wrap justify-center gap-3">
              {["2026 — MyVerse", "2027 — MyVerse", "2028 — MyVerse"].map(
                (year, index) => (
                  <View
                    key={year}
                    className="rounded-2xl border border-[#5a4740] bg-[#372925] px-5 py-4"
                  >
                    <Text className="text-sm font-semibold text-[#fff8ef]">
                      {year}
                    </Text>
                    <Text className="mt-1 text-xs text-[#bcaea5]">
                      {index === 0
                        ? "Your first chapter"
                        : "Still to be written"}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>

          <View
            className="my-24 items-center rounded-[34px] bg-[#e97850] px-6 py-16"
            style={styles.finalCta}
          >
            <Text className="text-center text-[11px] font-bold tracking-[2px] text-[#fff0db]">
              YOU’RE THE INSPIRATION
            </Text>
            <Text className="mt-5 max-w-[720px] text-center text-4xl font-semibold leading-[48px] tracking-tight text-white">
              Your story is already interesting. We just need to turn it into
              music.
            </Text>
            <Pressable
              onPress={showCreate}
              className="mt-8 rounded-full bg-[#fffaf2] px-7 py-4 shadow-sm active:scale-95"
            >
              <Text className="text-base font-bold text-[#3c2821]">
                Create my MyVerse →
              </Text>
            </Pressable>
            <Text className="mt-5 text-xs text-[#fff0dd]">
              Free to start · No musical experience required
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const fragmentPositions = [
  { top: 22, right: -25 },
  { top: 140, left: -42 },
  { bottom: 44, right: -34 },
  { bottom: -14, left: 28 },
];

const styles = StyleSheet.create({
  page: { minHeight: "100%" },
  grain: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
    backgroundColor: "#fcf8f1",
  },
  nav: {
    shadowColor: "#6D5647",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  heroWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 570,
  },
  heroCopy: { flex: 1, maxWidth: 570 },
  playerWrap: {
    width: "100%",
    maxWidth: 390,
    marginTop: 62,
    position: "relative",
  },
  playerWide: { marginTop: 0, marginLeft: 42 },
  player: {
    shadowColor: "#39231c",
    shadowOpacity: 0.27,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 15 },
    elevation: 12,
  },
  fragment: { position: "absolute" },
  storyRow: { gap: 16, paddingHorizontal: 20 },
  storyCard: { width: 260, height: 225 },
  storyOrb: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    opacity: 0.16,
    right: -25,
    top: -25,
  },
  snapshot: {
    shadowColor: "#4d352c",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  finalCta: {
    shadowColor: "#cb6c4d",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
});
