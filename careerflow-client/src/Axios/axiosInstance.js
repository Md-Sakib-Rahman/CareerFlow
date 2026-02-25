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
 * Optional: Global error handling for expired sessions.
 */
privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access - session might be expired.");
    }
    return Promise.reject(error);
  }
);