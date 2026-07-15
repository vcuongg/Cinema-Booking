import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (pathname !== "/admin/DashBoardAdmin") {
          router.replace("/admin/DashBoardAdmin");
        }

        return true;
      },
    );

    return () => subscription.remove();
  }, [pathname, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    />
  );
}
