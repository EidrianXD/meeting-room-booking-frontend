<template>
  <div class="login-page">
    <div class="login-page__card">
      <header class="login-page__header">
        <h1 class="text-heading-xl">Entrar</h1>
        <p class="text-caption">Use suas credenciais para acessar o sistema.</p>
      </header>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from "@/features/auth/components/LoginForm.vue";
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--page-bg);
  padding: var(--space-5);
}

.login-page__card {
  background-color: var(--surface);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.login-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
</style>
