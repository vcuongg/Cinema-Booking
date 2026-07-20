import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_PORT =
  process.env.EXPO_PUBLIC_API_PORT ?? "5001";

const WEB_API_URL =
  process.env.EXPO_PUBLIC_API_URL_WEB ??
  `http://localhost:${DEFAULT_API_PORT}/api`;

function resolveNativeApiUrl() {
  const explicitUrl =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_URL_IOS;

  if (explicitUrl) {
    return explicitUrl;
  }

  // Expo dev host lets real devices access backend running on the same LAN.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  const host = hostUri?.split(":")[0];

  if (host) {
    return `http://${host}:${DEFAULT_API_PORT}/api`;
  }

  return Platform.OS === "android"
    ? `http://10.0.2.2:${DEFAULT_API_PORT}/api`
    : `http://localhost:${DEFAULT_API_PORT}/api`;
}

export const API_BASE_URL =
  (Platform.OS === "web"
    ? WEB_API_URL
    : resolveNativeApiUrl()
  ).replace(/\/$/, "");

export function resolveAssetUrl(value?: string | null): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      const api = new URL(API_BASE_URL);

      // TMDB image paths are occasionally saved with the website host. The
      // dedicated CDN host is the supported image origin and works reliably
      // with Android image loaders.
      if (
        url.hostname === "www.themoviedb.org" &&
        url.pathname.startsWith("/t/p/")
      ) {
        url.hostname = "image.tmdb.org";
      }

      if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) url.hostname = api.hostname;
      if (Platform.OS === "android" && url.hostname !== api.hostname) url.protocol = "https:";
      return url.toString();
    } catch { return raw; }
  }
  const assetOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${assetOrigin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function buildBaseUrlCandidates() {
  const primary = API_BASE_URL;
  const secondary = primary.includes(":5001/")
    ? primary.replace(":5001/", ":5002/")
    : primary.includes(":5002/")
      ? primary.replace(":5002/", ":5001/")
      : null;

  return secondary && secondary !== primary
    ? [primary, secondary]
    : [primary];
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const baseUrls = buildBaseUrlCandidates();
  let lastError: unknown;

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}${normalizedEndpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      console.log(`[API] ${options.method ?? "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const responseText = await response.text();

      let data: unknown = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Backend returned invalid JSON. Status: ${response.status}`,
          );
        }
      }

      if (!response.ok) {
        // A stale backend process can still be listening on the first port
        // after the API was moved to the fallback port. Try the next backend
        // candidate for missing routes as well as connection failures.
        if (response.status === 404 && baseUrls.indexOf(baseUrl) < baseUrls.length - 1) {
          continue;
        }
        const errorData = data as ApiErrorResponse | null;

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      const isConnectionError =
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch");

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          `Backend response timeout: ${baseUrl}`,
        );
      }

      if (isConnectionError) {
        continue;
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        `Cannot connect to backend: ${baseUrl}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError instanceof Error) {
    throw new Error(
      `Cannot connect to backend: ${API_BASE_URL}`,
    );
  }

  throw new Error(
    `Cannot connect to backend: ${API_BASE_URL}`,
  );
}
