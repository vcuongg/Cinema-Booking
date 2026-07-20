import { useLocalSearchParams } from "expo-router";
import UpdateUserScreen from "@/features/admin/users/screens/UpdateUserScreen";

export default function UpdateUserRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UpdateUserScreen userId={id ?? ""} />;
}
