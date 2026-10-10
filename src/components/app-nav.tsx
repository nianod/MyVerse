import { Link, usePathname } from "expo-router"; import { Text, View } from "react-native";
const links = [["Home", "/home"], ["My Songs", "/songs"], ["Bookmarks", "/bookmarks"], ["Profile", "/profile"]] as const;
export function AppNav() { const path = usePathname(); return <View className="flex-row justify-around border-t border-[#e8dfd3] bg-[#fffdf9] p-4">{links.map(([label, href]) => <Link key={href} href={href} className={path === href ? "font-bold text-[#e9764e]" : "text-[#75665e]"}>{label}</Link>)}</View>; }
