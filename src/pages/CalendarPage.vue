<template>
  <q-page padding>
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="text-heading-xl">Calendário</h1>
          <p class="text-caption">Clique em um intervalo livre para criar; em um evento para ver detalhes.</p>
        </div>
      </header>

      <p v-if="loading" class="text-body">Carregando…</p>

      <BaseCard v-else-if="error" accent="danger">
        <p class="text-body">{{ error }}</p>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="refetch">Tentar novamente</BaseButton>
        </template>
      </BaseCard>

      <CalendarView
        v-else
        :events="events"
        @event-click="onEventClick"
        @slot-select="onSlotSelect"
      />
    </div>

    <BookingForm
      v-model="formOpen"
      :rooms="rooms"
      :initial-start="initialStart"
      :initial-end="initialEnd"
      @created="onCreated"
    />

    <q-dialog v-model="detailsOpen">
      <BaseCard v-if="selectedBooking" class="booking-details">
        <template #header>
          <h2 class="text-heading-lg">{{ selectedBooking.title }}</h2>
        </template>
        <div class="booking-details__meta">
          <div v-if="selectedBooking.roomName" class="booking-details__row">
            <span class="text-label">Sala</span>
            <span class="text-body">{{ selectedBooking.roomName }}</span>
          </div>
          <div class="booking-details__row">
            <span class="text-label">Horário</span>
            <span class="text-body">{{ formatRange(selectedBooking) }}</span>
          </div>
          <div v-if="selectedBooking.userName" class="booking-details__row">
            <span class="text-label">Responsável</span>
            <span class="text-body">{{ selectedBooking.userName }}</span>
          </div>
        </div>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="detailsOpen = false">Fechar</BaseButton>
        </template>
      </BaseCard>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import BookingForm from "@/features/bookings/components/BookingForm.vue";
import CalendarView from "@/features/calendar/components/CalendarView.vue";
import { useCalendar } from "@/features/calendar/composables/useCalendar";
import { useBookings } from "@/features/bookings/composables/useBookings";
import { useRoomStore } from "@/features/rooms/store/room.store";
import type { Booking } from "@/features/bookings/services/booking.service";

const $q = useQuasar();
const { bookings, loading, error, fetchAll } = useBookings();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const { bookingsToEvents } = useCalendar();

const formOpen = ref(false);
const initialStart = ref("");
const initialEnd = ref("");

const detailsOpen = ref(false);
const selectedBooking = ref<Booking | null>(null);

const events = computed(() =>
  bookingsToEvents(
    bookings.value,
    rooms.value.map((r) => r.id),
  ),
);

onMounted(async () => {
  await Promise.all([fetchAll(), roomStore.fetchRooms()]);
});

function refetch() {
  void fetchAll();
  void roomStore.fetchRooms();
}

function onEventClick(arg: EventClickArg) {
  const booking = arg.event.extendedProps.booking as Booking | undefined;
  if (!booking) return;
  selectedBooking.value = booking;
  detailsOpen.value = true;
}

function onSlotSelect(arg: DateSelectArg) {
  initialStart.value = toLocalInput(arg.start);
  initialEnd.value = toLocalInput(arg.end);
  formOpen.value = true;
}

function onCreated() {
  $q.notify({ message: "Reserva criada com sucesso", color: "positive", position: "top" });
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatRange(b: Booking): string {
  const start = new Date(b.startTime);
  const end = new Date(b.endTime);
  const dateFmt: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const sameDay = start.toDateString() === end.toDateString();
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
  flex-direction: column;
  gap: var(--space-1);
}

.booking-details {
  width: 100%;
  max-width: 480px;
}

.booking-details__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.booking-details__row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
