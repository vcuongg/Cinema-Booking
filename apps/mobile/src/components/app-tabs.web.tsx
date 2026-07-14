import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import {
  TabList,
  TabSlot,
  Tabs,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TabItem = {
  name: string;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const TAB_ITEMS: TabItem[] = [
  { name: 'home', href: '/', icon: 'home', label: 'Home' },
  { name: 'tickets', href: '/tickets', icon: 'ticket', label: 'Tickets' },
  { name: 'favourites', href: '/favourites', icon: 'heart', label: 'Favorites' },
  { name: 'profile', href: '/profile', icon: 'person', label: 'Profile' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />

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

function BottomTabBar({ children, ...props }: any) {
  return (
    <View {...props} style={styles.tabBar}>
      {children}
    </View>
  );
}

function TabButton({
  isFocused,
  icon,
  label,
  ...props
}: TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const color = isFocused ? '#E50000' : '#666';

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
