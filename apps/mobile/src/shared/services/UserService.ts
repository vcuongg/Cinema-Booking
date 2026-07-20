import { apiRequest } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AdminUser } from "../types/user";

export async function getUsers(): Promise<AdminUser[]> {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại bằng tài khoản admin.");
  }
  const response = await apiRequest<{ users?: AdminUser[] } | AdminUser[]>("/users", { auth: true });
  const users = Array.isArray(response) ? response : response.users;
  if (!users) throw new Error("API users trả về dữ liệu không hợp lệ.");
  return users;
}

export async function updateUser(id: string, data: Partial<AdminUser> & { password?: string }): Promise<AdminUser> {
  const response = await apiRequest<{ user: AdminUser }>(`/users/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) });
  return response.user;
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest(`/users/${id}`, { method: "DELETE", auth: true });
}
