<template>
  <div :class="['base-card', accent ? `base-card--accent-${accent}` : null]">
    <header v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <h3 v-if="title" class="text-heading-md base-card__title">{{ title }}</h3>
      </slot>
    </header>

    <div class="base-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
type Accent = "brand" | "success" | "warning" | "danger";

interface Props {
  title?: string;
  accent?: Accent;
}

defineProps<Props>();
</script>

<style scoped>
.base-card {
  background-color: var(--surface);
  color: var(--neutral-900);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.base-card--accent-brand { border-left: 4px solid var(--brand-600); }
.base-card--accent-success { border-left: 4px solid var(--success); }
.base-card--accent-warning { border-left: 4px solid var(--warning); }
.base-card--accent-danger { border-left: 4px solid var(--danger); }

.base-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.base-card__title {
  margin: 0;
  color: var(--neutral-900);
}

.base-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
