
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Định nghĩa 4 tab
const TAB_ITEMS = [
  { name: "home",       href: "/",            icon: "home",        label: "Home" },
  { name: "tickets",    href: "/tickets",     icon: "ticket",      label: "Tickets" },
  { name: "favourites", href: "/favourites",  icon: "heart",       label: "Favorites" },
  { name: "profile",    href: "/profile",     icon: "person",      label: "Profile" },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      {/* Nội dung màn hình */}
      <TabSlot style={{ flex: 1 }} />

      {/* Tab bar dưới cùng */}
      <TabList asChild>
        <BottomTabBar>
          {TAB_ITEMS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} />
            </TabTrigger>
          ))}
        </BottomTabBar>
      </TabList>
    </Tabs>
  );
}

// Tab bar container
function BottomTabBar({ children, ...props }: any) {
  return (
    <View {...props} style={styles.tabBar}>
      {children}
    </View>
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Từng nút tab
function TabButton({
  children,
  isFocused,
  icon,
  label,
  ...props
}: TabTriggerSlotProps & { icon: string; label: string }) {
  const color = isFocused ? "#E50000" : "#666";

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tabButton, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingBottom: 20,   // safe area cho iPhone, Android tự adjust
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
// import { NativeTabs } from 'expo-router/unstable-native-tabs';
// import { useColorScheme } from 'react-native';

// import { Colors } from '@/constants/theme';

// export default function AppTabs() {
//   const scheme = useColorScheme();
//   const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

//   return (
//     <NativeTabs
//       backgroundColor={colors.background}
//       indicatorColor={colors.backgroundElement}
//       labelStyle={{ selected: { color: colors.text } }}>
//       <NativeTabs.Trigger name="index">
//         <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/home.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="explore">
//         <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/explore.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }
