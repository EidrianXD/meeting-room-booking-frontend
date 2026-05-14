<template>
  <BaseCard>
    <div class="booking-card__top">
      <div class="booking-card__title-block">
        <h3 class="text-heading-md booking-card__title">{{ booking.title }}</h3>
        <p v-if="booking.roomName" class="text-caption">{{ booking.roomName }}</p>
      </div>
      <AppBadge v-if="isPast" variant="neutral">Encerrada</AppBadge>
      <AppBadge v-else-if="isOngoing" variant="info" dot>Em andamento</AppBadge>
      <AppBadge v-else variant="success" dot>Confirmada</AppBadge>
    </div>

    <div class="booking-card__meta">
      <div class="booking-card__row">
        <IconClock :size="16" stroke-width="2" class="booking-card__icon" />
        <span class="text-body">{{ formattedRange }}</span>
      </div>
      <div v-if="booking.userName" class="booking-card__row">
        <IconUsers :size="16" stroke-width="2" class="booking-card__icon" />
        <span class="text-body">{{ booking.userName }}</span>
      </div>
    </div>

    <template v-if="canCancel" #footer>
      <BaseButton variant="danger" size="sm" @click="emit('cancel', booking)">
        <template #icon-left>
          <IconTrash :size="16" stroke-width="2" />
        </template>
        Cancelar
      </BaseButton>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconClock, IconTrash, IconUsers } from "@tabler/icons-vue";
import AppBadge from "@/shared/components/AppBadge.vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import type { Booking } from "../services/booking.service";

const props = defineProps<{ booking: Booking }>();
const emit = defineEmits<{ cancel: [booking: Booking] }>();

const { user } = useAuth();

const canCancel = computed(() => {
  if (isPast.value) return false;
  return user.value?.id === props.booking.userId;
});

const isPast = computed(() => new Date(props.booking.endTime).getTime() < Date.now());
const isOngoing = computed(() => {
  const now = Date.now();
  return (
    new Date(props.booking.startTime).getTime() <= now &&
    new Date(props.booking.endTime).getTime() > now
  );
});

const formattedRange = computed(() => {
  const start = new Date(props.booking.startTime);
  const end = new Date(props.booking.endTime);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

  if (sameDay) {
    return `${start.toLocaleDateString("pt-BR", dateFmt)} · ${start.toLocaleTimeString(
      "pt-BR",
      timeFmt,
    )} – ${end.toLocaleTimeString("pt-BR", timeFmt)}`;
  }
  return `${start.toLocaleString("pt-BR", { ...dateFmt, ...timeFmt })} – ${end.toLocaleString(
    "pt-BR",
    { ...dateFmt, ...timeFmt },
  )}`;
});

</script>

<style scoped>
.booking-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.booking-card__title-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.booking-card__title {
  margin: 0;
  color: var(--neutral-900);
}

.booking-card__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.booking-card__row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--neutral-700);
}

.booking-card__icon {
  color: var(--neutral-500);
}
</style>
