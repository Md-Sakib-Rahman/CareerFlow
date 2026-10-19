// Unset variable -> local backend. Empty string -> same origin (production,
// where Vercel rewrites /auth and /api to the backend).
export const resolveBaseUrl = (value) => (value ?? "http://localhost:8080").replace(/\/+$/, "");

export const makeApiUrl = (base) => (path) => `${base}${path}`;

export const BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL);
export const apiUrl = makeApiUrl(BASE_URL);
