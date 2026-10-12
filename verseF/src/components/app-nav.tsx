import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
const links = [
  ["Home", "/home", "home"],
  ["My Songs", "/songs", "musical-notes"],
  ["Bookmarks", "/bookmarks", "bookmark"],
  ["Profile", "/profile", "person"],
] as const;
export function AppNav() {
  const path = usePathname();
  return (
    <View className="flex-row justify-around border-t border-[#e8dfd3] bg-[#fffdf9] px-2 pb-5 pt-2 shadow-sm">
      {links.map(([label, href, icon]) => {
        const active = path === href;
        return (
          <Link key={href} href={href} asChild>
            <Pressable className="min-h-11 min-w-16 items-center justify-center px-1 active:opacity-70">
              <View
                className={
                  active ? "rounded-full bg-[#fbe3d9] px-3 py-1" : "px-3 py-1"
                }
              >
                <Ionicons
                  name={(active ? icon : `${icon}-outline`) as never}
                  size={21}
                  color={active ? "#e9764e" : "#8b7d75"}
                />
              </View>
              <Text
                className={
                  active
                    ? "mt-0.5 text-[11px] font-bold text-[#e9764e]"
                    : "mt-0.5 text-[11px] text-[#8b7d75]"
                }
              >
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
