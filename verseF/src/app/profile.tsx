import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../providers/auth";
import { AppNav } from "../components/app-nav";
export default function Profile() {
  const { user, refresh, logout } = useAuth();
  const [name, setName] = useState(user?.name || ""),
    [stats, setStats] = useState({ songs: 0, bookmarks: 0 }),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!user) router.replace("/login");
    else
      api<{ stats: { songs: number; bookmarks: number } }>("/users/me").then(
        (data) => setStats(data.stats),
      );
  }, [user]);
  const save = async () => {
    await api("/users/me", { method: "PATCH", body: JSON.stringify({ name }) });
    await refresh();
    setMessage("Profile saved.");
  };
  return (
    <View className="flex-1 bg-[#fcf8f1]">
      <ScrollView className="flex-1 p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#e9764e]">
          <Text className="text-2xl font-bold text-white">
            {user?.name?.[0]}
          </Text>
        </View>
        <Text className="mt-4 text-3xl font-semibold text-[#241a17]">
          Profile
        </Text>
        <Text className="mt-1 text-[#75665e]">{user?.email}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="mt-6 rounded-xl bg-white p-4"
        />
        {!!message && <Text className="mt-3 text-green-700">{message}</Text>}
        <Pressable
          onPress={save}
          className="mt-4 rounded-full bg-[#241a17] p-4"
        >
          <Text className="text-center font-bold text-white">Save profile</Text>
        </Pressable>
        <View className="mt-8 flex-row gap-8">
          <Text className="text-[#75665e]">{stats.songs} songs</Text>
          <Text className="text-[#75665e]">{stats.bookmarks} bookmarks</Text>
        </View>
        <Pressable
          onPress={() => logout().then(() => router.replace("/"))}
          className="mt-10"
        >
          <Text className="font-semibold text-red-700">Log out</Text>
        </Pressable>
      </ScrollView>
      <AppNav />
    </View>
  );
}
