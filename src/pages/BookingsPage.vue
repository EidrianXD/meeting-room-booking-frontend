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

      <p v-if="loading" class="text-body">Carregando reservas…</p>

      <BaseCard v-else-if="error" accent="danger">
        <p class="text-body">{{ error }}</p>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="refetchAll">Tentar novamente</BaseButton>
        </template>
      </BaseCard>

      <p v-else-if="bookings.length === 0" class="text-body">Nenhuma reserva cadastrada.</p>

      <div v-else class="bookings-list">
        <BookingCard
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
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
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { IconCalendarPlus } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import BookingCard from "@/features/bookings/components/BookingCard.vue";
import BookingForm from "@/features/bookings/components/BookingForm.vue";
import { useBookings } from "@/features/bookings/composables/useBookings";
import { useRoomStore } from "@/features/rooms/store/room.store";
import type { Booking } from "@/features/bookings/services/booking.service";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const { bookings, loading, error, fetchAll, cancel } = useBookings();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);

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
    const message = extractErrorMessage(err);
    $q.notify({ message, color: "negative", position: "top" });
  }
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Não foi possível cancelar a reserva.";
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
</style>
