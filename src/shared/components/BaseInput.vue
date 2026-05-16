<template>
  <div :class="['base-input', { 'base-input--error': !!error, 'base-input--disabled': disabled }]">
    <label v-if="label" :for="inputId" class="base-input__label text-label">{{ label }}</label>

    <textarea
      v-if="variant === 'textarea'"
      :id="inputId"
      class="base-input__control base-input__control--textarea"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      @input="onInput"
    />

    <select
      v-else-if="variant === 'select'"
      :id="inputId"
      class="base-input__control"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="onInput"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>

    <input
      v-else
      :id="inputId"
      class="base-input__control"
      :type="variant"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />

    <p v-if="error" class="base-input__error text-caption">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";

type Variant = "text" | "datetime-local" | "select" | "textarea" | "email" | "password";

interface SelectOption {
  value: string | number;
  label: string;
}

interface Props {
  modelValue?: string | number | null;
  label?: string;
  placeholder?: string;
  variant?: Variant;
  disabled?: boolean;
  error?: string | null;
  options?: SelectOption[];
  rows?: number;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  variant: "text",
  disabled: false,
  rows: 3,
  options: () => [],
});

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const autoId = useId();
const inputId = computed(() => props.id ?? `base-input-${autoId}`);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  emit("update:modelValue", target.value);
}
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.base-input__label {
  color: var(--neutral-700);
}

.base-input__control {
  font-family: inherit;
  font-size: var(--font-size-body);
  color: var(--neutral-900);
  background-color: var(--surface);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  height: 40px;
  min-width: 0;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.base-input__control--textarea {
  height: auto;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.base-input__control::placeholder {
  color: var(--neutral-500);
}

.base-input__control:focus {
  outline: none;
  border-color: var(--brand-600);
  box-shadow: 0 0 0 3px var(--brand-200);
}

.base-input--error .base-input__control {
  border-color: var(--danger);
  background-color: color-mix(in srgb, var(--danger) 6%, var(--surface));
}

.base-input--error .base-input__control:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 30%, transparent);
}

.base-input__error {
  color: var(--danger);
}

.base-input--disabled .base-input__control,
.base-input__control:disabled {
  background-color: var(--neutral-100);
  color: var(--neutral-500);
  cursor: not-allowed;
}
</style>
