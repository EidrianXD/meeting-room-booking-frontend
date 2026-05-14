import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const routerReplace = vi.fn().mockResolvedValue(undefined);

vi.mock("vue-router", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

vi.mock("@/features/auth/services/auth.service", () => ({
  authService: { login: vi.fn() },
}));

import { authService } from "@/features/auth/services/auth.service";
import { useAuth } from "@/features/auth/composables/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";

const loginMock = vi.mocked(authService.login);

describe("useAuth", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    loginMock.mockReset();
    routerReplace.mockClear();
    window.localStorage.clear();
  });

  it("salva token e usuário no store após login bem-sucedido", async () => {
    loginMock.mockResolvedValue({
      token: "tok-123",
      user: { id: "u1", username: "alice", name: "Alice" },
    });

    const { login } = useAuth();
    await login({ username: "alice", password: "pw" });

    const store = useAuthStore();
    expect(store.token).toBe("tok-123");
    expect(store.user).toEqual({ id: "u1", username: "alice", name: "Alice" });
    expect(store.isAuthenticated).toBe(true);
    expect(window.localStorage.getItem("auth-token")).toBe("tok-123");
  });

  it("limpa store e navega para login após logout", async () => {
    const store = useAuthStore();
    store.setSession("tok", { id: "u1", username: "alice", name: "Alice" });

    const { logout } = useAuth();
    await logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(window.localStorage.getItem("auth-token")).toBeNull();
    expect(routerReplace).toHaveBeenCalledWith({ name: "login" });
  });
});
