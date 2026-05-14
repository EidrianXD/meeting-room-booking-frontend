<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['base-btn', `base-btn--${variant}`, `base-btn--${size}`]"
    @click="onClick"
  >
    <slot name="icon-left" />
    <span v-if="$slots.default" class="base-btn__label"><slot /></span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type ButtonType = "button" | "submit" | "reset";

interface Props {
  variant?: Variant;
  size?: Size;
  type?: ButtonType;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

function onClick(event: MouseEvent) {
  emit("click", event);
}
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
}

.base-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--brand-200);
}

.base-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* Sizes */
.base-btn--sm {
  height: 28px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-caption);
}
.base-btn--md {
  height: 36px;
  padding: 0 var(--space-4);
  font-size: var(--font-size-body);
}
.base-btn--lg {
  height: 44px;
  padding: 0 var(--space-5);
  font-size: var(--font-size-heading-md);
}

/* Variants */
.base-btn--primary {
  background-color: var(--brand-600);
  color: #ffffff;
}
.base-btn--primary:hover:not(:disabled) {
  background-color: var(--brand-700);
}

.base-btn--secondary {
  background-color: var(--surface);
  color: var(--neutral-900);
  border-color: var(--neutral-300);
}
.base-btn--secondary:hover:not(:disabled) {
  background-color: var(--neutral-100);
}

.base-btn--ghost {
  background-color: transparent;
  color: var(--brand-600);
}
.base-btn--ghost:hover:not(:disabled) {
  background-color: var(--brand-50);
}

.base-btn--danger {
  background-color: var(--danger);
  color: #ffffff;
}
.base-btn--danger:hover:not(:disabled) {
  filter: brightness(0.92);
}

.base-btn__label {
  line-height: 1;
}
</style>
