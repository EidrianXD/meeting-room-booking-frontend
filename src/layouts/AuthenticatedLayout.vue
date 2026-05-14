<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="auth-header">
      <div class="auth-header__inner">
        <router-link :to="{ name: 'rooms' }" class="auth-header__brand text-heading-md">
          Meeting Room Booking
        </router-link>

        <nav class="auth-header__nav">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="{ name: link.name }"
            class="auth-header__link"
            active-class="auth-header__link--active"
          >
            {{ link.label }}
          </router-link>
        </nav>

        <div class="auth-header__actions">
          <BaseButton variant="ghost" size="sm" @click="toggleDark">
            {{ isDark ? "Modo claro" : "Modo escuro" }}
          </BaseButton>

          <BaseButton variant="secondary" size="sm" @click="onLogout">
            <template #icon-left>
              <IconLogout :size="18" stroke-width="2" />
            </template>
            Sair
          </BaseButton>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { IconLogout } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import { useTheme } from "@/shared/composables/useTheme";
import { TOKEN_STORAGE_KEY } from "@/shared/http";

const router = useRouter();
const { isDark, toggleDark } = useTheme();

const navLinks = [
  { name: "rooms", label: "Salas" },
  { name: "bookings", label: "Reservas" },
  { name: "calendar", label: "Calendário" },
];

function onLogout() {
  // O auth.store da Etapa 5 vai assumir essa lógica; por ora limpamos a chave que o guard observa.
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  void router.replace({ name: "login" });
}
</script>

<style scoped>
.auth-header {
  background-color: var(--surface);
  color: var(--neutral-900);
  border-bottom: 1px solid var(--neutral-300);
  box-shadow: none;
}

.auth-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-5);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.auth-header__brand {
  color: var(--brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.auth-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-4);
  flex: 1;
}

.auth-header__link {
  color: var(--neutral-700);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  transition: background-color 120ms ease;
}

.auth-header__link:hover {
  background-color: var(--neutral-100);
}

.auth-header__link--active {
  color: var(--brand-600);
  background-color: var(--brand-50);
}

.auth-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
