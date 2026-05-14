import { computed } from "vue";
import { useRouter } from "vue-router";
import { authService, type LoginCredentials } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => store.isAuthenticated);
  const user = computed(() => store.user);

  async function login(credentials: LoginCredentials): Promise<void> {
    const { token, user: authUser } = await authService.login(credentials);
    store.setSession(token, authUser);
  }

  async function logout(): Promise<void> {
    store.clearSession();
    await router.replace({ name: "login" });
  }

  return { isAuthenticated, user, login, logout };
}
