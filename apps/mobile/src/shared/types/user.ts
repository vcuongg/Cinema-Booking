export interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "staff" | "customer";
  createdAt?: string;
}
