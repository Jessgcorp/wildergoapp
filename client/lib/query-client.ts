import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";

const LIVE_PRODUCTION_API_URL =
  "https://aa60d38e-336a-4c6c-8c7a-2e8f4ae13a3f-00-37dgmtff0mvif.picard.replit.dev/";

function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function ensureHttpUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const localHostPattern =
    /^(localhost|127\.0\.0\.1|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;
  if (localHostPattern.test(url)) {
    return `http://${url}`;
  }

  return `https://${url}`;
}

/**
 * REST API base URL for native apps.
 * Never use the Metro / Expo Go bundle host (*.exp.direct) as the API — that host only serves JS
 * and would send /api traffic through Metro's dev proxy (or time out).
 */
export function getApiUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const loc = window.location;
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
      return "http://localhost:5000/";
    }
    return `${loc.protocol}//${loc.host}/`;
  }

  const explicitApi = process.env.EXPO_PUBLIC_API_URL;
  if (explicitApi) {
    return withTrailingSlash(ensureHttpUrl(explicitApi));
  }

  // Simulator / emulator share the dev machine's localhost (not extra.apiBaseUrl remote).
  if (__DEV__ && !Device.isDevice) {
    if (Platform.OS === "ios") {
      return "http://127.0.0.1:5000/";
    }
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000/";
    }
  }

  const embedded =
    (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
    // Some production builds expose `manifest`/`manifest2` instead of `expoConfig`.
    ((Constants as any).manifest?.extra?.apiBaseUrl as string | undefined) ??
    ((Constants as any).manifest2?.extra?.apiBaseUrl as string | undefined);
  if (embedded) {
    return withTrailingSlash(ensureHttpUrl(embedded));
  }

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return withTrailingSlash(ensureHttpUrl(domain));
  }

  const hostUri =
    Constants.expoConfig?.extra?.expoGo?.debuggerHost ||
    Constants.expoConfig?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const raw = hostUri.split("/")[0];
    if (!raw.includes("exp.direct") && !raw.includes(".exp.")) {
      // LAN: Metro /api proxy on same host:port as the packager (http, keep port)
      return withTrailingSlash(
        raw.startsWith("http://") || raw.startsWith("https://")
          ? raw
          : `http://${raw}`,
      );
    }
  }

  console.warn(
    "No API URL configured. Set EXPO_PUBLIC_API_URL or extra.apiBaseUrl in app.json.",
  );
  // Never fall back to localhost in production builds.
  // If env/extra isn't wired correctly, we still need a real reachable backend for auth.
  return __DEV__ ? "http://127.0.0.1:5000/" : LIVE_PRODUCTION_API_URL;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
