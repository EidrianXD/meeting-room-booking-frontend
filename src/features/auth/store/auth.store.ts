import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { TOKEN_STORAGE_KEY } from "@/shared/http";
import type { AuthUser } from "../services/auth.service";

const USER_STORAGE_KEY = "auth-user";

function readPersistedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  const isAuthenticated = computed(() => token.value !== null);

  function setSession(nextToken: string, nextUser: AuthUser) {
    token.value = nextToken;
    user.value = nextUser;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    }
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  function hydrate() {
    if (typeof window === "undefined") return;
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = readPersistedUser();
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = savedUser;
    } else {
      clearSession();
    }
  }

  return { token, user, isAuthenticated, setSession, clearSession, hydrate };
});

export { USER_STORAGE_KEY };
