<template>
  <div class="mini-cal">
    <header class="mini-cal__header">
      <button
        type="button"
        class="mini-cal__nav"
        aria-label="Mês anterior"
        @click="prevMonth"
      >
        ‹
      </button>
      <span class="mini-cal__title">{{ monthLabel }}</span>
      <button
        type="button"
        class="mini-cal__nav"
        aria-label="Próximo mês"
        @click="nextMonth"
      >
        ›
      </button>
    </header>

    <div class="mini-cal__weekdays">
      <span v-for="day in WEEKDAYS" :key="day">{{ day }}</span>
    </div>

    <div class="mini-cal__grid" @mouseleave="onGridLeave">
      <button
        v-for="cell in cells"
        :key="cell.iso"
        type="button"
        :class="['mini-cal__day', ...cellClasses(cell)]"
        @mousedown.left.prevent="onMouseDown(cell, $event)"
        @mouseenter="onMouseEnter(cell)"
        @mouseup="onMouseUp(cell)"
      >
        {{ cell.day }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

interface DateRange {
  from: string;
  to: string;
}

interface Cell {
  iso: string; // "YYYY-MM-DD"
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

interface Props {
  /** Range selecionado pelo usuário (controlled). `from === to` significa um único dia. */
  modelValue: DateRange | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: DateRange | null];
}>();

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Mês exibido. Inicia com o mês atual ou com o mês do range já selecionado.
const viewMonth = ref(new Date());

// Sincroniza viewMonth se modelValue mudar externamente para um mês fora do atual.
watch(
  () => props.modelValue,
  (val) => {
    if (!val) return;
    const target = parseLocal(val.from);
    if (
      target.getMonth() !== viewMonth.value.getMonth() ||
      target.getFullYear() !== viewMonth.value.getFullYear()
    ) {
      viewMonth.value = new Date(target.getFullYear(), target.getMonth(), 1);
    }
  },
);

const monthLabel = computed(() => {
  const label = viewMonth.value.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  // "maio de 2026" → "Maio de 2026"
  return label.charAt(0).toUpperCase() + label.slice(1);
});

const cells = computed<Cell[]>(() => {
  const year = viewMonth.value.getFullYear();
  const month = viewMonth.value.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = domingo

  const todayIso = toIso(new Date());
  const result: Cell[] = [];

  // 42 células = 6 semanas, garante grid estável independente do mês
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    result.push({
      iso: toIso(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: toIso(d) === todayIso,
    });
  }
  return result;
});

// -- Drag state ------------------------------------------------------------

const dragStart = ref<string | null>(null);
const dragCurrent = ref<string | null>(null);

function onMouseDown(cell: Cell, event: MouseEvent) {
  if (event.button !== 0) return; // só botão esquerdo
  dragStart.value = cell.iso;
  dragCurrent.value = cell.iso;
  // Listener global: se o usuário soltar fora do grid, ainda finalizamos.
  window.addEventListener("mouseup", onGlobalMouseUp);
}

function onMouseEnter(cell: Cell) {
  if (dragStart.value === null) return;
  dragCurrent.value = cell.iso;
}

function onMouseUp(cell: Cell) {
  if (dragStart.value === null) return;
  finalize(cell.iso);
}

function onGridLeave() {
  // Se o mouse sair da grid, mantém o último dragCurrent (não cancela).
  // Pode-se mover de volta ou soltar — o onGlobalMouseUp resolve.
}

function onGlobalMouseUp() {
  if (dragStart.value === null) {
    cleanup();
    return;
  }
  // Se houve um drag, dragCurrent reflete a última célula com hover.
  // Se foi clique sem mover, dragCurrent === dragStart → range de 1 dia.
  finalize(dragCurrent.value ?? dragStart.value);
}

function finalize(endIso: string) {
  const startIso = dragStart.value!;
  const from = startIso <= endIso ? startIso : endIso;
  const to = startIso <= endIso ? endIso : startIso;
  emit("update:modelValue", { from, to });
  cleanup();
}

function cleanup() {
  dragStart.value = null;
  dragCurrent.value = null;
  window.removeEventListener("mouseup", onGlobalMouseUp);
}

onUnmounted(cleanup);

// -- Classes visuais -------------------------------------------------------

function cellClasses(cell: Cell): string[] {
  const classes: string[] = [];
  if (!cell.inMonth) classes.push("mini-cal__day--out");
  if (cell.isToday) classes.push("mini-cal__day--today");

  // Range já confirmado (vindo do prop)
  if (props.modelValue) {
    const { from, to } = props.modelValue;
    if (cell.iso >= from && cell.iso <= to) classes.push("mini-cal__day--in-range");
    if (cell.iso === from) classes.push("mini-cal__day--range-start");
    if (cell.iso === to) classes.push("mini-cal__day--range-end");
  }

  // Preview enquanto o usuário arrasta
  if (dragStart.value && dragCurrent.value) {
    const a = dragStart.value;
    const b = dragCurrent.value;
    const lo = a <= b ? a : b;
    const hi = a <= b ? b : a;
    if (cell.iso >= lo && cell.iso <= hi) classes.push("mini-cal__day--drag-preview");
  }

  return classes;
}

// -- Navegação de mês ------------------------------------------------------

function prevMonth() {
  const d = new Date(viewMonth.value);
  d.setMonth(d.getMonth() - 1);
  viewMonth.value = d;
}
function nextMonth() {
  const d = new Date(viewMonth.value);
  d.setMonth(d.getMonth() + 1);
  viewMonth.value = d;
}

// -- Helpers ---------------------------------------------------------------

function toIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseLocal(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}
</script>

<style scoped>
.mini-cal {
  background-color: var(--surface);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mini-cal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.mini-cal__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-900);
}

.mini-cal__nav {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--neutral-700);
  cursor: pointer;
  width: 24px;
  height: 24px;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mini-cal__nav:hover {
  background-color: var(--neutral-100);
  color: var(--neutral-900);
}

.mini-cal__nav:focus-visible {
  outline: none;
  border-color: var(--brand-600);
}

.mini-cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  font-size: 10px;
  color: var(--neutral-500);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0 2px;
}

.mini-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-cal__day {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--neutral-900);
  cursor: pointer;
  font-size: var(--font-size-caption);
  font-family: inherit;
  padding: 0;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 80ms ease;
}

.mini-cal__day:hover {
  background-color: var(--neutral-100);
}

.mini-cal__day--out {
  color: var(--neutral-500);
}

.mini-cal__day--today {
  font-weight: var(--font-weight-medium);
  box-shadow: inset 0 0 0 1px var(--brand-600);
  color: var(--brand-600);
}

.mini-cal__day--drag-preview {
  background-color: color-mix(in srgb, var(--brand-600) 16%, transparent);
  color: var(--brand-700);
}

.mini-cal__day--in-range {
  background-color: color-mix(in srgb, var(--brand-600) 14%, transparent);
  color: var(--brand-700);
  border-radius: 0;
}

.mini-cal__day--range-start,
.mini-cal__day--range-end {
  background-color: var(--brand-600);
  color: #ffffff;
  border-radius: var(--radius-sm);
}

.mini-cal__day--range-start.mini-cal__day--range-end {
  /* Range de 1 dia — quadrado simples */
  border-radius: var(--radius-sm);
}

.mini-cal__day:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-200);
}
</style>
