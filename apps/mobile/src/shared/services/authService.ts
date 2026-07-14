import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "./api";

import type {
  ApiMessageResponse,
  AuthResponse,
} from "../types/auth";

export interface LoginPayload {
  account: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

async function saveAuthSession(
  response: AuthResponse,
): Promise<void> {
  if (!response.token || !response.user) {
    throw new Error("Invalid authentication response");
  }

  await AsyncStorage.multiSet([
    ["token", response.token],
    ["user", JSON.stringify(response.user)],
  ]);
}

export const authService = {
  async login(
    payload: LoginPayload,
  ): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    await saveAuthSession(response);

    return response;
  },

  async register(
    payload: RegisterPayload,
  ): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    await saveAuthSession(response);

    return response;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async verifyOTP(
    payload: VerifyOTPPayload,
  ): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(
      "/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<ApiMessageResponse> {
    return apiRequest<ApiMessageResponse>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(["token", "user"]);
  },
};