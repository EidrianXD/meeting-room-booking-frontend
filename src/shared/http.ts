import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const TOKEN_STORAGE_KEY = "auth-token";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const http: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export { TOKEN_STORAGE_KEY };
