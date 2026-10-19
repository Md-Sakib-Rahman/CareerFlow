import axios from "axios";

// Clean Base URL to allow for multiple feature routes (auth, jobs, etc.)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * 1. Public API Instance
 * For routes that don't require authentication.
 */
export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Necessary for secure HttpOnly refresh cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 2. Private API Instance
 * For protected routes requiring a Bearer token.
 */
export const privateApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 3. Request Interceptor
 * Injects the Access Token into the headers of all privateApi calls.
 */
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 4. Response Interceptor
 * On 401, refresh the access token once (shared between concurrent requests)
 * and retry the original request once.
 */

// Registered from Redux/store.js so this file never imports the store
// (authSlice imports this file, which would make a circular import).
let authHandlers = {
  onTokenRefreshed: () => {},
  onSessionExpired: () => {},
};
export const setAuthHandlers = (handlers) => {
  authHandlers = { ...authHandlers, ...handlers };
};

const NO_REFRESH_URLS =
  /\/auth\/(login|register|google|send-otp|forgot-password|reset-password|refresh-token)/;

let refreshPromise = null;
const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = publicApi
      .get("/auth/refresh-token")
      .then((res) => {
        const { accessToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        authHandlers.onTokenRefreshed(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const expireSession = () => {
  localStorage.removeItem("accessToken");
  authHandlers.onSessionExpired();
};

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status !== 401 || !config || NO_REFRESH_URLS.test(config.url || "")) {
      return Promise.reject(error);
    }
    if (config._retry) {
      // The retried request was rejected again: give up, no loop.
      expireSession();
      return Promise.reject(error);
    }
    config._retry = true;
    let token;
    try {
      token = await refreshAccessToken();
    } catch {
      expireSession();
      return Promise.reject(error);
    }
    config.headers.Authorization = `Bearer ${token}`;
    return privateApi(config);
  }
);
