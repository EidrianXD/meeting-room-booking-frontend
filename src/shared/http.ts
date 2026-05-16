import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const TOKEN_STORAGE_KEY = "auth-token";
const USER_STORAGE_KEY = "auth-user";

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

// Em caso de 401 fora do endpoint de login (= token expirado/invalidado),
// limpa a sessão persistida e redireciona para /login. Usamos `window.location`
// em vez de injetar o router/store aqui para preservar a regra "shared não
// importa de features" — o boot file vai hidratar do localStorage zerado.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isLoginAttempt = url.includes("/auth/login");
      if (!isLoginAttempt) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        const onLoginPage = window.location.pathname.startsWith("/login");
        if (!onLoginPage) {
          const redirect = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.assign(`/login?redirect=${redirect}`);
        }
      }
    }
    return Promise.reject(error);
  },
);

export { TOKEN_STORAGE_KEY, USER_STORAGE_KEY };
