export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "staff" | "customer";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}