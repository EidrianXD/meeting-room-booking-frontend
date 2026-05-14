<template>
  <FullCalendar :options="options" class="calendar-view" />
</template>

<script setup lang="ts">
import { computed } from "vue";
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

const options = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: props.initialView,
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
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
  events: props.events,
  eventClick: (arg) => emit("event-click", arg),
  select: (arg) => emit("slot-select", arg),
}));
</script>

<style scoped>
.calendar-view {
  background-color: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-300);
  padding: var(--space-3);
  min-height: 640px;
}

/* Tokens do FullCalendar para o tema light (dark é tratado em tokens.dark.css) */
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
}

.calendar-view :deep(.fc .fc-button-primary:not(:disabled).fc-button-active) {
  color: #ffffff;
}
</style>
