import { useLocalSearchParams } from "expo-router";
import UpdateRoomScreen from "@/features/admin/rooms/screens/UpdateRoomScreen";

export default function UpdateRoomRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UpdateRoomScreen roomId={id ?? ""} />;
}
