<template>
  <BaseCard class="room-card">
    <div class="room-card__header">
      <IconBuilding :size="20" stroke-width="2" class="room-card__icon" />
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
.room-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.room-card__icon {
  color: var(--brand-600);
}

.room-card__name {
  margin: 0;
  color: var(--neutral-900);
}
</style>
