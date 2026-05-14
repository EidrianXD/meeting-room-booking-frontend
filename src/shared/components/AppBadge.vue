<template>
  <span :class="['app-badge', `app-badge--${variant}`]">
    <span v-if="dot" class="app-badge__dot" />
    <component v-if="icon" :is="icon" class="app-badge__icon" :size="14" stroke-width="2" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { Component } from "vue";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

interface Props {
  variant?: Variant;
  dot?: boolean;
  icon?: Component;
}

withDefaults(defineProps<Props>(), {
  variant: "neutral",
  dot: false,
});
</script>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  border: 1px solid transparent;
}

.app-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
}

.app-badge__icon {
  flex-shrink: 0;
}

.app-badge--success {
  background-color: color-mix(in srgb, var(--success) 12%, transparent);
  color: var(--success);
}
.app-badge--warning {
  background-color: color-mix(in srgb, var(--warning) 12%, transparent);
  color: var(--warning);
}
.app-badge--danger {
  background-color: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}
.app-badge--info {
  background-color: var(--brand-50);
  color: var(--info);
}
.app-badge--neutral {
  background-color: var(--neutral-100);
  color: var(--neutral-700);
}
</style>
