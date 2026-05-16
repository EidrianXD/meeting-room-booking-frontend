<template>
  <BaseCard class="room-card">
    <div class="room-card__header">
      <span class="room-card__icon-wrap">
        <IconBuilding :size="20" stroke-width="2" />
      </span>
      <h3 class="text-heading-md room-card__name">{{ room.name }}</h3>
    </div>

    <template #footer>
      <BaseButton variant="primary" size="md" @click="$emit('reserve', room)">
        <template #icon-left>
          <IconCalendarPlus :size="18" stroke-width="2" />
        </template>
        Reservar
      </BaseButton>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { IconBuilding, IconCalendarPlus } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import type { Room } from "../services/room.service";

defineProps<{ room: Room }>();
defineEmits<{ reserve: [room: Room] }>();
</script>

<style scoped>
.room-card {
  position: relative;
}

.room-card:hover {
  border-color: var(--brand-200);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--brand-600) 8%, transparent);
}

.room-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.room-card__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--brand-50);
  color: var(--brand-600);
  flex-shrink: 0;
}

.room-card__name {
  margin: 0;
  color: var(--neutral-900);
}
</style>
