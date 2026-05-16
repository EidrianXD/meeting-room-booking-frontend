<template>
  <FullCalendar ref="calendarRef" :options="options" class="calendar-view" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";

interface Props {
  events: EventInput[];
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
}

const props = withDefaults(defineProps<Props>(), { initialView: "timeGridWeek" });
const emit = defineEmits<{
  "event-click": [arg: EventClickArg];
  "slot-select": [arg: DateSelectArg];
}>();

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.sm);

const options = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: isMobile.value ? "timeGridDay" : props.initialView,
  // View customizada de range arbitrário. SEM `duration` (a presença dela
  // congelaria o número de dias e ignoraria o `{start, end}` passado no
  // changeView). Em vez disso, calculamos a duração dinamicamente na
  // chamada de `setVisibleRange`.
  views: {
    timeGridRange: {
      type: "timeGrid",
      buttonText: "Período",
    },
  },
  headerToolbar: isMobile.value
    ? { left: "prev,next", center: "title", right: "today" }
    : {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
  footerToolbar: isMobile.value
    ? { left: "", center: "dayGridMonth,timeGridWeek,timeGridDay", right: "" }
    : undefined,
  buttonText: {
    today: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
  },
  locale: "pt-br",
  firstDay: 1,
  allDaySlot: false,
  slotMinTime: "07:00:00",
  slotMaxTime: "22:00:00",
  height: "100%",
  expandRows: true,
  nowIndicator: true,
  selectable: true,
  selectMirror: true,
  longPressDelay: 250,
  // false = eventos concorrentes ficam lado-a-lado em sub-colunas (Google Agenda).
  // true (default) faz eles se sobreporem visualmente, escondendo conteúdo.
  slotEventOverlap: false,
  events: props.events,
  eventClick: (arg) => emit("event-click", arg),
  select: (arg) => emit("slot-select", arg),
}));

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);

function gotoDate(date: Date | string): void {
  calendarRef.value?.getApi().gotoDate(date);
}

/**
 * Renderiza um intervalo arbitrário (1 ou mais dias) usando a view customizada
 * `timeGridRange`. `end` é *exclusivo* (convenção do FullCalendar — para mostrar
 * 15 a 17, passe end = 18).
 *
 * Usamos `setOption('visibleRange')` + `changeView` em vez de só `changeView`
 * porque sem `duration` explícita na view, o argumento `{start, end}` do
 * changeView nem sempre é respeitado entre transições — `visibleRange` global
 * é o que efetivamente delimita o range exibido.
 */
function setVisibleRange(start: Date, end: Date): void {
  const api = calendarRef.value?.getApi();
  if (!api) return;
  api.setOption("visibleRange", { start, end });
  api.changeView("timeGridRange", { start, end });
}

/** Volta para a view padrão (semana/dia) na data atual e limpa qualquer range. */
function resetToWeek(): void {
  const api = calendarRef.value?.getApi();
  if (!api) return;
  // setOption pra undefined remove a restrição. Sem isso, o visibleRange
  // anterior fica grudado e a próxima view não navega como esperado.
  api.setOption("visibleRange", undefined);
  api.changeView(isMobile.value ? "timeGridDay" : "timeGridWeek");
  api.gotoDate(new Date());
}

/** Muda para visualização mensal centrada na data passada. */
function setMonthView(date: Date): void {
  const api = calendarRef.value?.getApi();
  if (!api) return;
  api.setOption("visibleRange", undefined);
  api.changeView("dayGridMonth", date);
}

defineExpose({ gotoDate, setVisibleRange, resetToWeek, setMonthView });
</script>

<style scoped>
.calendar-view {
  background-color: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-300);
  padding: var(--space-3);
  min-height: 640px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* impede que sub-colunas de eventos transbordem para fora */
}

@media (max-width: 599px) {
  .calendar-view {
    padding: var(--space-2);
    min-height: 540px;
  }
}

/* Mapeia tokens do FullCalendar para nossos design tokens (dark é tratado em tokens.dark.css). */
.calendar-view :deep(.fc) {
  --fc-border-color: var(--neutral-300);
  --fc-page-bg-color: var(--surface);
  --fc-neutral-bg-color: var(--neutral-100);
  --fc-today-bg-color: var(--brand-50);
  --fc-button-bg-color: var(--surface);
  --fc-button-border-color: var(--neutral-300);
  --fc-button-text-color: var(--neutral-900);
  --fc-button-hover-bg-color: var(--neutral-100);
  --fc-button-hover-border-color: var(--neutral-300);
  --fc-button-active-bg-color: var(--brand-600);
  --fc-button-active-border-color: var(--brand-600);
  color: var(--neutral-900);
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
}

.calendar-view :deep(.fc .fc-button) {
  border-radius: var(--radius-md);
  text-transform: none;
  font-weight: var(--font-weight-medium);
  padding: 4px var(--space-2);
}

.calendar-view :deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  color: #ffffff;
}

.calendar-view :deep(.fc .fc-toolbar-title) {
  font-size: var(--font-size-heading-md);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 599px) {
  .calendar-view :deep(.fc .fc-toolbar-title) {
    font-size: var(--font-size-body);
  }
  .calendar-view :deep(.fc-footer-toolbar) {
    margin-top: var(--space-3) !important;
    justify-content: center;
  }
}
</style>
