import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { api, assetUrl } from "../../lib/api";
import { AppNav } from "../../components/app-nav";

type Song = {
  _id: string;
  title?: string;
  genre: string;
  mood: string;
  language: string;
  status: string;
  error?: string;
  audioUrl?: string;
  lyrics?: { title: string; sections: { type: string; lines: string[] }[] };
};
const waitingCopy: Record<string, string> = {
  pending: "Getting your MyVerse ready…",
  generating_lyrics: "Writing your lyrics…",
  generating_audio: "Finding your voice…",
};

function NarrationPlayer({ url }: { url: string }) {
  const player = useAudioPlayer(url, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const percent = status.duration
    ? Math.min(100, (status.currentTime / status.duration) * 100)
    : 0;
  return (
    <View className="mt-6 rounded-2xl bg-[#2d211d] p-5">
      <Text className="text-base font-bold text-white">Narrated lyrics</Text>
      <Text className="mt-1 text-sm text-[#dfd1c5]">
        A spoken narration, not song audio.
      </Text>
      <View className="mt-4 flex-row items-center gap-3">
        <Pressable
          onPress={() => (status.playing ? player.pause() : player.play())}
          className="h-11 w-11 items-center justify-center rounded-full bg-[#e9764e]"
        >
          <Ionicons
            name={status.playing ? "pause" : "play"}
            size={20}
            color="white"
          />
        </Pressable>
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-[#5a4841]">
          <View
            className="h-full bg-[#f7c86b]"
            style={{ width: `${percent}%` }}
          />
        </View>
        <Text className="text-xs text-[#dfd1c5]">
          {Math.floor(status.currentTime)}s
        </Text>
      </View>
    </View>
  );
}

export default function SongDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [song, setSong] = useState<Song>();
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState("");
  const load = () =>
    api<{ song: Song; bookmarked: boolean }>(`/songs/${id}`)
      .then((data) => {
        setSong(data.song);
        setBookmarked(data.bookmarked);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, [id]);
  useEffect(() => {
    if (
      !song ||
      !["pending", "generating_lyrics", "generating_audio"].includes(
        song.status,
      )
    )
      return;
    const timer = setInterval(() => void load(), 3000);
    return () => clearInterval(timer);
  }, [song?.status, id]);
  const retry = async () => {
    await api(`/songs/${id}/retry`, { method: "POST" });
    await load();
  };
  const toggleBookmark = async () => {
    await api(`/bookmarks/${id}`, { method: bookmarked ? "DELETE" : "POST" });
    setBookmarked(!bookmarked);
  };
  return (
    <View className="flex-1 bg-[#fcf8f1]">
      <ScrollView className="flex-1 p-6">
        <Pressable onPress={() => router.back()} className="mb-5">
          <Text className="font-semibold text-[#9b633b]">‹ Back</Text>
        </Pressable>
        {error ? (
          <Text className="text-red-700">{error}</Text>
        ) : !song ? (
          <ActivityIndicator color="#e9764e" />
        ) : (
          <>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-3xl font-semibold text-[#241a17]">
                  {song.title || "Your MyVerse"}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  <Text className="rounded-full bg-[#f4ece1] px-3 py-1 text-sm text-[#75665e]">
                    {song.genre}
                  </Text>
                  <Text className="rounded-full bg-[#f4ece1] px-3 py-1 text-sm text-[#75665e]">
                    {song.mood}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={toggleBookmark}
                className="rounded-full bg-white p-3"
              >
                <Ionicons
                  name={bookmarked ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color="#9b633b"
                />
              </Pressable>
            </View>
            {waitingCopy[song.status] && (
              <View className="mt-8 items-center rounded-2xl bg-[#f4ece1] p-6">
                <ActivityIndicator color="#e9764e" />
                <Text className="mt-3 font-semibold text-[#241a17]">
                  {waitingCopy[song.status]}
                </Text>
              </View>
            )}
            {song.status === "failed" && (
              <View className="mt-8 rounded-2xl bg-[#fbe3d9] p-5">
                <Text className="font-semibold text-[#8e3f2b]">
                  {song.error || "We couldn't create this MyVerse."}
                </Text>
                <Pressable
                  onPress={retry}
                  className="mt-4 rounded-full bg-[#e9764e] p-3"
                >
                  <Text className="text-center font-bold text-white">
                    Retry
                  </Text>
                </Pressable>
              </View>
            )}
            {song.audioUrl && (
              <NarrationPlayer url={assetUrl(song.audioUrl) || song.audioUrl} />
            )}
            {song.status === "ready" && !song.audioUrl && (
              <Text className="mt-6 rounded-xl bg-[#f4ece1] p-4 text-[#75665e]">
                Narration is not available for {song.language} yet. Your lyrics
                are ready.
              </Text>
            )}
            {song.lyrics?.sections.map((section, index) => (
              <View key={`${section.type}-${index}`} className="mt-7">
                <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-[#9b633b]">
                  {section.type}
                </Text>
                {section.lines.map((line, lineIndex) => (
                  <Text
                    key={lineIndex}
                    className="text-lg leading-8 text-[#332522]"
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <AppNav />
    </View>
  );
}
