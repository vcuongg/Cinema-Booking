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
// import {
//   Tabs,
//   TabList,
//   TabTrigger,
//   TabSlot,
//   TabTriggerSlotProps,
//   TabListProps,
// } from 'expo-router/ui';
// import { SymbolView } from 'expo-symbols';
// import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

// import { ExternalLink } from './external-link';
// import { ThemedText } from './themed-text';
// import { ThemedView } from './themed-view';

// import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

// export default function AppTabs() {
//   return (
//     <Tabs>
//       <TabSlot style={{ height: '100%' }} />
//       <TabList asChild>
//         <CustomTabList>
//           <TabTrigger name="home" href="/" asChild>
//             <TabButton>Home</TabButton>
//           </TabTrigger>
//           <TabTrigger name="explore" href="/explore" asChild>
//             <TabButton>Explore</TabButton>
//           </TabTrigger>
//         </CustomTabList>
//       </TabList>
//     </Tabs>
//   );
// }

// export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
//   return (
//     <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
//       <ThemedView
//         type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
//         style={styles.tabButtonView}>
//         <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
//           {children}
//         </ThemedText>
//       </ThemedView>
//     </Pressable>
//   );
// }

// export function CustomTabList(props: TabListProps) {
//   const scheme = useColorScheme();
//   const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

//   return (
//     <View {...props} style={styles.tabListContainer}>
//       <ThemedView type="backgroundElement" style={styles.innerContainer}>
//         <ThemedText type="smallBold" style={styles.brandText}>
//           Expo Starter
//         </ThemedText>

//         {props.children}

//         <ExternalLink href="https://docs.expo.dev" asChild>
//           <Pressable style={styles.externalPressable}>
//             <ThemedText type="link">Docs</ThemedText>
//             <SymbolView
//               tintColor={colors.text}
//               name={{ ios: 'arrow.up.right.square', web: 'link' }}
//               size={12}
//             />
//           </Pressable>
//         </ExternalLink>
//       </ThemedView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   tabListContainer: {
//     position: 'absolute',
//     width: '100%',
//     padding: Spacing.three,
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   innerContainer: {
//     paddingVertical: Spacing.two,
//     paddingHorizontal: Spacing.five,
//     borderRadius: Spacing.five,
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexGrow: 1,
//     gap: Spacing.two,
//     maxWidth: MaxContentWidth,
//   },
//   brandText: {
//     marginRight: 'auto',
//   },
//   pressed: {
//     opacity: 0.7,
//   },
//   tabButtonView: {
//     paddingVertical: Spacing.one,
//     paddingHorizontal: Spacing.three,
//     borderRadius: Spacing.three,
//   },
//   externalPressable: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: Spacing.one,
//     marginLeft: Spacing.three,
//   },
// });
