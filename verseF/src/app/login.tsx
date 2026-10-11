import { useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../providers/auth";
export default function Login() {
  const [email, setEmail] = useState(""),
    [passcode, setPasscode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, passcode }),
      });
      await refresh();
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View className="flex-1 justify-center bg-[#fcf8f1] px-6">
      <Text className="text-4xl font-semibold text-[#241a17]">
        Welcome back
      </Text>
      <Text className="mt-2 text-[#75665e]">Your story still has a sound.</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        className="mt-8 rounded-xl border border-[#e5d6c8] bg-white p-4"
      />
      <TextInput
        value={passcode}
        onChangeText={setPasscode}
        secureTextEntry
        placeholder="Passcode"
        className="mt-3 rounded-xl border border-[#e5d6c8] bg-white p-4"
      />
      {!!error && <Text className="mt-3 text-red-700">{error}</Text>}
      <Pressable
        onPress={submit}
        disabled={busy}
        className="mt-5 rounded-full bg-[#241a17] p-4"
      >
        <Text className="text-center font-bold text-white">
          {busy ? "Logging in…" : "Log in"}
        </Text>
      </Pressable>
      <Link href="/register" className="mt-5 text-center text-[#9b633b]">
        New here? Create an account 
      </Link>
    </View>
  );
}
