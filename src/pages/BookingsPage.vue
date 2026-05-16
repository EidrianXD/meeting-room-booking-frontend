<template>
  <q-page padding>
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="text-heading-xl">Reservas</h1>
          <p class="text-caption">Suas reservas e as dos demais usuários.</p>
        </div>
        <BaseButton variant="primary" size="md" @click="openNewBooking()">
          <template #icon-left>
            <IconCalendarPlus :size="18" stroke-width="2" />
          </template>
          Nova reserva
        </BaseButton>
      </header>

      <p v-if="loading" class="text-body state-message">Carregando reservas…</p>

      <BaseCard v-else-if="error" accent="danger">
        <p class="text-body">{{ error }}</p>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="refetchAll">Tentar novamente</BaseButton>
        </template>
      </BaseCard>

      <div v-else-if="bookings.length === 0" class="empty-state">
        <span class="empty-state__icon">
          <IconClock :size="28" stroke-width="1.75" />
        </span>
        <p class="text-heading-md empty-state__title">Nenhuma reserva ainda</p>
        <p class="text-caption">Crie sua primeira reserva clicando em "Nova reserva".</p>
      </div>

      <div v-else class="bookings-list">
        <BookingCard
          v-for="booking in enrichedBookings"
          :key="booking.id"
          :booking="booking"
          :current-user-id="user?.id ?? null"
          @cancel="onCancel"
        />
      </div>
    </div>

    <BookingForm
      v-model="formOpen"
      :rooms="rooms"
      :initial-room-id="preselectedRoomId"
      @created="onCreated"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { IconCalendarPlus, IconClock } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import BookingCard from "@/features/bookings/components/BookingCard.vue";
import BookingForm from "@/features/bookings/components/BookingForm.vue";
import { useBookings } from "@/features/bookings/composables/useBookings";
import { useRoomStore } from "@/features/rooms/store/room.store";
import { useAuth } from "@/features/auth/composables/useAuth";
import { toApiError } from "@/shared/api-error";
import type { Booking } from "@/features/bookings/services/booking.service";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const { bookings, loading, error, fetchAll, cancel } = useBookings();
const { user } = useAuth();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);

// Enriquece cada reserva com o nome da sala, fazendo o join no client com o
// `useRoomStore`. O backend devolve só `roomId` — esse mapeamento é necessário
// para BookingCard exibir "Sala A" em vez de só o ID.
const enrichedBookings = computed(() =>
  bookings.value.map((booking) => ({
    ...booking,
    roomName: booking.roomName ?? rooms.value.find((r) => r.id === booking.roomId)?.name,
  })),
);

const formOpen = ref(false);
const preselectedRoomId = ref<string>("");

onMounted(async () => {
  await Promise.all([fetchAll(), roomStore.fetchRooms()]);
  const queryRoomId = typeof route.query.roomId === "string" ? route.query.roomId : null;
  if (queryRoomId) openNewBooking(queryRoomId);
});

function refetchAll() {
  void fetchAll();
}

function openNewBooking(roomId = "") {
  preselectedRoomId.value = roomId;
  formOpen.value = true;
}

function onCreated() {
  void router.replace({ query: {} });
  $q.notify({ message: "Reserva criada com sucesso", color: "positive", position: "top" });
}

async function onCancel(booking: Booking) {
  try {
    await cancel(booking.id);
    $q.notify({ message: "Reserva cancelada", color: "positive", position: "top" });
  } catch (err: unknown) {
    const apiError = toApiError(err, "Não foi possível cancelar a reserva.");
    $q.notify({ message: apiError.message, color: "negative", position: "top" });
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}

.state-message {
  color: var(--neutral-700);
  text-align: center;
  padding: var(--space-5) 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-5);
  background-color: var(--surface);
  border: 1px dashed var(--neutral-300);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--brand-50);
  color: var(--brand-600);
  margin-bottom: var(--space-2);
}

.empty-state__title {
  margin: 0;
  color: var(--neutral-900);
}

@media (max-width: 599px) {
  .page-header { gap: var(--space-3); }
}
</style>
