import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../providers/auth";
import { AppNav } from "../components/app-nav";
export default function Home() {
  const { user, loading } = useAuth();
  const [story, setStory] = useState(""),
    [title, setTitle] = useState(""),
    [mood, setMood] = useState("nostalgic"),
    [genre, setGenre] = useState("Afrobeat"),
    [language, setLanguage] = useState("English"),
    [error, setError] = useState(""),
    [touched, setTouched] = useState(false),
    [recent, setRecent] = useState<
      { _id: string; title?: string; status: string }[]
    >([]),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user)
      api<{ songs: { _id: string; title?: string; status: string }[] }>(
        "/songs?limit=3",
      )
        .then((data) => setRecent(data.songs))
        .catch(() => {});
  }, [user]);
  if (!loading && !user) {
    router.replace("/login");
    return null;
  }
  const submit = async () => {
    setTouched(true);
    if (story.trim().length < 50)
      return setError("Tell us a little more of your story.");
    setBusy(true);
    setError("");
    try {
      const result = await api<{ song: { _id: string } }>("/songs", {
        method: "POST",
        body: JSON.stringify({
          title,
          story,
          mood,
          genre,
          language,
        }),
      });
      setStory("");
      router.push(`/song/${result.song._id}` as never);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to create your MyVerse.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View className="flex-1 bg-[#fcf8f1]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
          <Text className="text-3xl font-semibold text-[#241a17]">
            Welcome back, {user?.name?.split(" ")[0] || "there"}.
          </Text>
          <Text className="mt-2 text-[#75665e]">
            Your story has a sound. What are we creating today?
          </Text>
          <View className="mt-8 rounded-3xl bg-[#f4ece1] p-5">
            <Text className="text-xl font-semibold text-[#241a17]">
              Create a MyVerse
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Working title (optional)"
              className="mt-4 rounded-xl bg-white p-4"
            />
            <TextInput
              value={story}
              onChangeText={(value) => {
                setStory(value);
                if (touched)
                  setError(
                    value.trim().length < 50
                      ? "Tell us a little more of your story."
                      : "",
                  );
              }}
              onBlur={() => {
                setTouched(true);
                if (story.trim().length < 50)
                  setError("Tell us a little more of your story.");
              }}
              multiline
              maxLength={3000}
              placeholder="Tell us your story…"
              className="mt-3 min-h-[150px] rounded-xl bg-white p-4"
            />
            <Text className="mt-2 text-right text-xs text-[#75665e]">
              {story.length}/3000 · at least 50 characters
            </Text>
            <Choice
              label="Genre"
              value={genre}
              setValue={setGenre}
              options={["Afrobeat", "Rap", "Gospel", "R&B", "Pop", "Acoustic"]}
            />
            <Choice
              label="Mood"
              value={mood}
              setValue={setMood}
              options={[
                "nostalgic",
                "hopeful",
                "joyful",
                "reflective",
                "heartbreak",
                "empowered",
              ]}
            />
            <Choice
              label="Language"
              value={language}
              setValue={setLanguage}
              options={[
                "English",
                "Swahili",
                "Sheng",
                "Kikuyu",
                "Luo",
                "Arabic",
              ]}
            />
            {!!error && <Text className="mt-3 text-red-700">{error}</Text>}
            <Pressable
              onPress={submit}
              disabled={busy}
              className="mt-5 rounded-full bg-[#e9764e] p-4"
            >
              {busy ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center font-bold text-white">
                  Create MyVerse →
                </Text>
              )}
            </Pressable>
          </View>
          <Text className="mt-7 text-lg font-semibold text-[#241a17]">
            Prompt ideas
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {[
              "a memory with a friend",
              "a hard season",
              "a dream you're chasing",
            ].map((idea) => (
              <Pressable
                key={idea}
                onPress={() => setStory(`Write about ${idea}: `)}
                className="rounded-full bg-[#f4ece1] px-3 py-2"
              >
                <Text className="text-sm text-[#9b633b]">Try: {idea}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="mt-7 text-lg font-semibold text-[#241a17]">
            Recent songs
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {recent.length ? (
              recent.map((song) => (
                <Pressable
                  key={song._id}
                  onPress={() => router.push(`/song/${song._id}` as never)}
                  className="mr-3 w-40 rounded-2xl bg-white p-4"
                >
                  <Text
                    className="font-semibold text-[#241a17]"
                    numberOfLines={1}
                  >
                    {song.title || "Untitled MyVerse"}
                  </Text>
                  <Text className="mt-2 text-xs text-[#75665e]">
                    {song.status}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text className="text-[#75665e]">
                Your new MyVerses will appear here.
              </Text>
            )}
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppNav />
    </View>
  );
}

function Choice({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <View className="mt-4">
      <Text className="mb-2 font-semibold text-[#241a17]">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => setValue(option)}
              className={
                value === option
                  ? "rounded-full bg-[#e9764e] px-3 py-2"
                  : "rounded-full bg-white px-3 py-2"
              }
            >
              <Text
                className={
                  value === option
                    ? "text-sm font-semibold text-white"
                    : "text-sm text-[#75665e]"
                }
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
