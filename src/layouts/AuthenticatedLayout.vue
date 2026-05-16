<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="auth-header">
      <div class="auth-header__inner">
        <router-link :to="{ name: 'rooms' }" class="auth-header__brand text-heading-md">
          <span class="auth-header__brand-full">Meeting Room Booking</span>
          <span class="auth-header__brand-short">MRB</span>
        </router-link>

        <nav class="auth-header__nav" :aria-label="'Navegação principal'">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="{ name: link.name }"
            class="auth-header__link"
            active-class="auth-header__link--active"
          >
            <component :is="link.icon" :size="18" stroke-width="2" class="auth-header__link-icon" />
            <span class="auth-header__link-label">{{ link.label }}</span>
          </router-link>
        </nav>

        <div class="auth-header__actions">
          <button
            type="button"
            class="auth-header__icon-btn"
            :aria-label="isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'"
            @click="toggleDark"
          >
            <span class="auth-header__theme-toggle">
              {{ isDark ? "☼" : "☾" }}
            </span>
          </button>

          <div v-if="user" class="auth-header__user" :title="user.name">
            {{ initials }}
          </div>

          <BaseButton variant="secondary" size="sm" class="auth-header__logout" @click="onLogout">
            <template #icon-left>
              <IconLogout :size="16" stroke-width="2" />
            </template>
            <span class="auth-header__logout-label">Sair</span>
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
import { computed } from "vue";
import { IconBuilding, IconCalendar, IconClock, IconLogout } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import { useTheme } from "@/shared/composables/useTheme";
import { useAuth } from "@/features/auth/composables/useAuth";

const { isDark, toggleDark } = useTheme();
const { logout, user } = useAuth();

const navLinks = [
  { name: "rooms", label: "Salas", icon: IconBuilding },
  { name: "bookings", label: "Reservas", icon: IconClock },
  { name: "calendar", label: "Calendário", icon: IconCalendar },
];

const initials = computed(() => {
  const name = user.value?.name ?? user.value?.username ?? "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
});

function onLogout() {
  void logout();
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
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.auth-header__brand {
  color: var(--brand-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.auth-header__brand-short { display: none; }

.auth-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.auth-header__nav::-webkit-scrollbar { display: none; }

.auth-header__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--neutral-700);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  transition: background-color 120ms ease, color 120ms ease;
  white-space: nowrap;
}

.auth-header__link:hover {
  background-color: var(--neutral-100);
}

.auth-header__link--active {
  color: var(--brand-600);
  background-color: var(--brand-50);
}

.auth-header__link-icon { flex-shrink: 0; }

.auth-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.auth-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  color: var(--neutral-700);
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}

.auth-header__icon-btn:hover {
  background-color: var(--neutral-100);
  color: var(--neutral-900);
}

.auth-header__icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--brand-200);
}

.auth-header__theme-toggle {
  font-size: 18px;
  line-height: 1;
}

.auth-header__user {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--brand-50);
  color: var(--brand-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

/* Mobile (< 600px) — brand compacto, esconder labels textuais */
@media (max-width: 599px) {
  .auth-header__inner { padding: var(--space-2) var(--space-3); gap: var(--space-2); }
  .auth-header__brand-full { display: none; }
  .auth-header__brand-short { display: inline; }
  .auth-header__link-label { display: none; }
  .auth-header__link { padding: var(--space-2); }
  .auth-header__logout-label { display: none; }
  .auth-header__user { display: none; }
}
</style>
