<template>
  <q-page class="login-page">
    <div class="login-page__card">
      <h1 class="text-heading-xl">Entrar</h1>
      <p class="text-body">Formulário implementado na Etapa 5.</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Placeholder. Conteúdo real (LoginForm + useAuth) entra na Etapa 5.
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
  gap: var(--space-3);
}
</style>
