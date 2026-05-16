<template>
  <form class="login-form" novalidate @submit.prevent="onSubmit">
    <BaseInput
      v-model="username"
      label="Usuário"
      placeholder="seu.usuario"
      :error="errors.username"
      :disabled="loading"
    />

    <BaseInput
      v-model="password"
      label="Senha"
      variant="password"
      placeholder="••••••••"
      :error="errors.password"
      :disabled="loading"
    />

    <p v-if="submitError" class="login-form__error text-caption">{{ submitError }}</p>

    <BaseButton type="submit" variant="primary" size="lg" :disabled="loading">
      {{ loading ? "Entrando…" : "Entrar" }}
    </BaseButton>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseInput from "@/shared/components/BaseInput.vue";
import { toApiError } from "@/shared/api-error";
import { useAuth } from "../composables/useAuth";

const { login } = useAuth();
const router = useRouter();
const route = useRoute();

const username = ref("");
const password = ref("");

const errors = reactive<{ username: string | null; password: string | null }>({
  username: null,
  password: null,
});

const submitError = ref<string | null>(null);
const loading = ref(false);

function validate(): boolean {
  errors.username = username.value.trim() ? null : "Informe o usuário";
  errors.password = password.value ? null : "Informe a senha";
  return !errors.username && !errors.password;
}

async function onSubmit() {
  submitError.value = null;
  if (!validate()) return;

  loading.value = true;
  try {
    await login({ username: username.value.trim(), password: password.value });
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : null;
    await router.replace(redirect ?? { name: "rooms" });
  } catch (err: unknown) {
    const apiError = toApiError(err, "Não foi possível entrar.");
    // Para 401 no login = credenciais inválidas. Sobrescrevemos a mensagem global
    // do interceptor com algo específico do contexto.
    submitError.value =
      apiError.status === 401 ? "Usuário ou senha incorretos." : apiError.message;
    if (apiError.fieldErrors.username) errors.username = apiError.fieldErrors.username;
    if (apiError.fieldErrors.password) errors.password = apiError.fieldErrors.password;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-form__error {
  color: var(--danger);
}
</style>
