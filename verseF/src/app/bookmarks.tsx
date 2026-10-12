import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../providers/auth";
import { AppNav } from "../components/app-nav";
type Song = {
  _id: string;
  title?: string;
  genre: string;
  mood: string;
  status: string;
};
export default function Bookmarks() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const load = () =>
    api<{ songs: Song[] }>("/bookmarks").then((data) => setSongs(data.songs));
  useEffect(() => {
    if (!user) router.replace("/login");
    else load();
  }, [user]);
  return (
    <View className="flex-1 bg-[#fcf8f1]">
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-semibold text-[#241a17]">Bookmarks</Text>
        {songs.length === 0 ? (
          <Text className="mt-12 text-center text-[#75665e]">
            Save the songs that feel most like you.
          </Text>
        ) : (
          songs.map((song) => (
            <Pressable key={song._id} onPress={() => router.push(`/song/${song._id}` as never)} className="mt-4 rounded-2xl bg-white p-5 active:opacity-70">
              <Text className="text-lg font-semibold text-[#241a17]">
                {song.title || "Untitled MyVerse"}
              </Text>
              <Text className="mt-1 text-[#75665e]">
                {song.genre} · {song.mood} · {song.status}
              </Text>
              <Pressable
                onPress={() =>
                  api(`/bookmarks/${song._id}`, { method: "DELETE" }).then(load)
                }
                className="mt-3"
              >
                <Text className="text-[#9b633b]">Remove bookmark</Text>
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>
      <AppNav />
    </View>
  );
}
