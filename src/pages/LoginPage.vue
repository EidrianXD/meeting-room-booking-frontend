<template>
  <div class="login-page">
    <div class="login-page__card">
      <div class="login-page__brand">
        <span class="login-page__brand-mark">
          <IconBuilding :size="24" stroke-width="2" />
        </span>
        <div>
          <p class="text-caption login-page__brand-label">Meeting Room Booking</p>
          <h1 class="text-heading-xl login-page__title">Entrar</h1>
        </div>
      </div>
      <p class="text-body login-page__hint">Use suas credenciais para acessar o sistema.</p>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconBuilding } from "@tabler/icons-vue";
import LoginForm from "@/features/auth/components/LoginForm.vue";
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, var(--brand-50) 0%, transparent 40%),
    radial-gradient(circle at bottom right, var(--brand-50) 0%, transparent 50%),
    var(--page-bg);
  padding: var(--space-5);
}

.login-page__card {
  background-color: var(--surface);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--neutral-900) 6%, transparent);
}

.login-page__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.login-page__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--brand-50);
  color: var(--brand-600);
  flex-shrink: 0;
}

.login-page__brand-label {
  color: var(--brand-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.login-page__title {
  margin: 0;
  color: var(--neutral-900);
}

.login-page__hint {
  color: var(--neutral-700);
  margin: 0;
}

@media (max-width: 480px) {
  .login-page__card { padding: var(--space-5); }
}
</style>
