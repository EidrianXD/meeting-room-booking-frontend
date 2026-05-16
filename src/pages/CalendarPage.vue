<template>
  <q-page class="calendar-page">
    <p v-if="loading" class="text-body calendar-page__state">Carregando…</p>

    <BaseCard v-else-if="error" accent="danger" class="calendar-page__error">
      <p class="text-body">{{ error }}</p>
      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="refetch">Tentar novamente</BaseButton>
      </template>
    </BaseCard>

    <div v-else class="calendar-page__layout">
      <aside class="calendar-page__sidebar">
        <BaseButton class="calendar-page__create" variant="primary" size="md" @click="openCreateModal()">
          <template #icon-left>
            <IconCalendarPlus :size="18" stroke-width="2" />
          </template>
          Nova reserva
        </BaseButton>

        <div class="calendar-page__mini-wrap">
          <MiniCalendar
            v-model="dateRange"
            @update:model-value="onDateChange"
          />

          <div class="calendar-page__range-info">
            <p class="text-caption calendar-page__range-text">{{ rangeLabel }}</p>
            <button
              v-if="hasCustomRange"
              type="button"
              class="calendar-page__range-clear"
              @click="clearRange"
            >
              Limpar período
            </button>
          </div>
        </div>

        <section class="calendar-page__legend">
          <p class="text-label calendar-page__legend-title">Salas</p>
          <ul class="calendar-page__legend-list">
            <li v-for="(room, idx) in rooms" :key="room.id" class="calendar-page__legend-item">
              <span
                class="calendar-page__legend-dot"
                :style="{ backgroundColor: paletteColor(idx) }"
                aria-hidden="true"
              />
              <span class="text-body">{{ room.name }}</span>
            </li>
            <li v-if="rooms.length === 0" class="text-caption calendar-page__legend-empty">
              Nenhuma sala carregada.
            </li>
          </ul>
        </section>
      </aside>

      <section class="calendar-page__main">
        <CalendarView
          ref="calendarRef"
          :events="events"
          @event-click="onEventClick"
          @slot-select="onSlotSelect"
        />
      </section>
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
import { IconCalendarPlus } from "@tabler/icons-vue";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import BookingForm from "@/features/bookings/components/BookingForm.vue";
import CalendarView from "@/features/calendar/components/CalendarView.vue";
import MiniCalendar from "@/features/calendar/components/MiniCalendar.vue";
import { useCalendar } from "@/features/calendar/composables/useCalendar";
import { useBookings } from "@/features/bookings/composables/useBookings";
import { useRoomStore } from "@/features/rooms/store/room.store";
import type { Booking } from "@/features/bookings/services/booking.service";

/**
 * Range selecionado pelo usuário no MiniCalendar. `from === to` representa um
 * único dia (clique sem arrasto). `null` é o estado inicial.
 */
interface DateRange {
  from: string;
  to: string;
}

const $q = useQuasar();
const { bookings, loading, error, fetchAll } = useBookings();
const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const { bookingsToEvents } = useCalendar();

const calendarRef = ref<InstanceType<typeof CalendarView> | null>(null);
const dateRange = ref<DateRange | null>(null);

const formOpen = ref(false);
const initialStart = ref("");
const initialEnd = ref("");

const detailsOpen = ref(false);
const selectedBooking = ref<Booking | null>(null);

// Paleta sincronizada manualmente com useCalendar (poucas cores, troca rara).
const PALETTE = ["var(--brand-600)", "var(--success)", "var(--warning)", "var(--danger)", "var(--info)"];
function paletteColor(index: number): string {
  return PALETTE[index % PALETTE.length] ?? PALETTE[0]!;
}

const hasCustomRange = computed(() => dateRange.value !== null);

const rangeLabel = computed(() => {
  const v = dateRange.value;
  if (!v) return "Clique em um dia ou arraste para selecionar um período.";
  if (v.from === v.to) return `Dia: ${formatBR(v.from)}`;
  const days = Math.round(
    (parseLocal(v.to).getTime() - parseLocal(v.from).getTime()) / 86_400_000,
  ) + 1;
  if (days > MAX_DAYS_IN_TIMEGRID) {
    return `Período: ${formatBR(v.from)} – ${formatBR(v.to)} (${days} dias → vista mensal)`;
  }
  return `Período: ${formatBR(v.from)} – ${formatBR(v.to)} (${days} dias)`;
});

const enrichedBookings = computed(() =>
  bookings.value.map((booking) => ({
    ...booking,
    roomName: booking.roomName ?? rooms.value.find((r) => r.id === booking.roomId)?.name,
  })),
);

const events = computed(() =>
  bookingsToEvents(
    enrichedBookings.value,
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

// Limite de dias em que ainda vale mostrar uma view tipo "semana custom".
// Acima disso o grid de horas fica ilegível — passamos para visualização mensal.
const MAX_DAYS_IN_TIMEGRID = 14;

function onDateChange(value: DateRange | null) {
  if (!value) return;

  const start = parseLocal(value.from);
  const endInclusive = parseLocal(value.to);

  // Cálculo inclusivo (mesma data = 1 dia; 15 e 16 = 2 dias).
  const days = Math.round((endInclusive.getTime() - start.getTime()) / 86_400_000) + 1;

  if (days > MAX_DAYS_IN_TIMEGRID) {
    calendarRef.value?.setMonthView(start);
    return;
  }

  // Para timeGrid o `end` é exclusivo — somamos 1 dia.
  const end = new Date(endInclusive);
  end.setDate(end.getDate() + 1);
  calendarRef.value?.setVisibleRange(start, end);
}

function clearRange() {
  dateRange.value = null;
  calendarRef.value?.resetToWeek();
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

function openCreateModal() {
  initialStart.value = "";
  initialEnd.value = "";
  formOpen.value = true;
}

function onCreated() {
  $q.notify({ message: "Reserva criada com sucesso", color: "positive", position: "top" });
}

// -- Helpers de data -------------------------------------------------------

function parseLocal(iso: string): Date {
  // "YYYY-MM-DD" — `new Date(iso)` interpretaria como UTC, dando shift em fusos
  // negativos. Construir explicitamente em horário local evita isso.
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatBR(iso: string): string {
  return parseLocal(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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
.calendar-page {
  padding: var(--space-4);
}

.calendar-page__state {
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--neutral-700);
}

.calendar-page__error {
  max-width: 480px;
  margin: var(--space-5) auto;
}

.calendar-page__layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-4);
  align-items: start;
  max-width: 1500px;
  margin: 0 auto;
}

.calendar-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  position: sticky;
  top: var(--space-4);
}

.calendar-page__create {
  width: 100%;
}

.calendar-page__mini-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.calendar-page__range-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
}

.calendar-page__range-text {
  color: var(--neutral-700);
  margin: 0;
}

.calendar-page__range-clear {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--brand-600);
  font-size: var(--font-size-caption);
  cursor: pointer;
  text-align: left;
  width: fit-content;
}

.calendar-page__range-clear:hover {
  text-decoration: underline;
}

.calendar-page__legend {
  background-color: var(--surface);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.calendar-page__legend-title {
  margin: 0;
  color: var(--neutral-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-page__legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.calendar-page__legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.calendar-page__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.calendar-page__legend-empty {
  color: var(--neutral-500);
}

.calendar-page__main {
  min-width: 0;
  overflow: hidden; /* grid item respeita 1fr mesmo quando FC pede mais largura */
}

@media (max-width: 1023px) {
  .calendar-page__layout {
    grid-template-columns: 220px 1fr;
    gap: var(--space-3);
  }
}

@media (max-width: 767px) {
  .calendar-page__layout {
    grid-template-columns: 1fr;
  }
  .calendar-page__sidebar {
    position: static;
  }
  .calendar-page__mini-wrap,
  .calendar-page__legend {
    display: none;
  }
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
