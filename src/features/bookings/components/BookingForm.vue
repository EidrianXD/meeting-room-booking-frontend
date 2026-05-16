<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    :maximized="$q.screen.lt.sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="booking-form-dialog">
      <header class="booking-form-dialog__header">
        <h2 class="text-heading-lg">Nova reserva</h2>
        <button class="booking-form-dialog__close" type="button" @click="close" aria-label="Fechar">
          <IconX :size="18" stroke-width="2" />
        </button>
      </header>

      <form class="booking-form" novalidate @submit.prevent="onSubmit">
        <BaseInput
          v-model="form.title"
          label="Título"
          placeholder="Ex.: Sprint planning"
          :error="errors.title"
          :disabled="submitting"
        />

        <BaseInput
          v-model="form.roomId"
          label="Sala"
          variant="select"
          placeholder="Selecione uma sala"
          :options="roomOptions"
          :error="errors.roomId"
          :disabled="submitting"
        />

        <BaseInput
          v-model="form.startTime"
          label="Início"
          variant="datetime-local"
          :error="errors.startTime"
          :disabled="submitting"
        />

        <BaseInput
          v-model="form.endTime"
          label="Término"
          variant="datetime-local"
          :error="errors.endTime"
          :disabled="submitting"
        />

        <p v-if="submitError" class="booking-form__error text-caption">{{ submitError }}</p>

        <div class="booking-form__actions">
          <BaseButton type="button" variant="secondary" :disabled="submitting" @click="close">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? "Salvando…" : "Confirmar" }}
          </BaseButton>
        </div>
      </form>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { IconX } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseInput from "@/shared/components/BaseInput.vue";
import { toApiError } from "@/shared/api-error";
import { useBookings, type BookingFormErrors } from "../composables/useBookings";

const $q = useQuasar();

interface RoomOption {
  id: string;
  name: string;
}

interface Props {
  modelValue: boolean;
  rooms: RoomOption[];
  initialRoomId?: string;
  initialStart?: string;
  initialEnd?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialRoomId: "",
  initialStart: "",
  initialEnd: "",
});
const emit = defineEmits<{
  "update:modelValue": [open: boolean];
  created: [];
}>();

const { validate, hasErrors, create } = useBookings();

const form = reactive({
  title: "",
  roomId: "",
  startTime: "",
  endTime: "",
});

const errors = reactive<BookingFormErrors>({
  title: null,
  roomId: null,
  startTime: null,
  endTime: null,
});

const submitError = ref<string | null>(null);
const submitting = ref(false);

const roomOptions = computed(() =>
  props.rooms.map((r) => ({ value: r.id, label: r.name })),
);

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm();
  },
);

function resetForm() {
  form.title = "";
  form.roomId = props.initialRoomId ?? "";
  form.startTime = props.initialStart ?? "";
  form.endTime = props.initialEnd ?? "";
  errors.title = null;
  errors.roomId = null;
  errors.startTime = null;
  errors.endTime = null;
  submitError.value = null;
}

function close() {
  emit("update:modelValue", false);
}

async function onSubmit() {
  submitError.value = null;
  const next = validate({ ...form });
  Object.assign(errors, next);
  if (hasErrors(next)) return;

  submitting.value = true;
  try {
    await create({ ...form });
    emit("created");
    close();
  } catch (err: unknown) {
    const apiError = toApiError(err, "Não foi possível criar a reserva.");
    // Para conflito de horário (409), o backend já manda a mensagem semântica
    // certa em `error`; só repassamos. Para 400 com `details`, distribuímos as
    // mensagens nos campos correspondentes.
    submitError.value = apiError.message;
    const fe = apiError.fieldErrors;
    if (fe.title) errors.title = fe.title;
    if (fe.roomId) errors.roomId = fe.roomId;
    if (fe.startTime) errors.startTime = fe.startTime;
    if (fe.endTime) errors.endTime = fe.endTime;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.booking-form-dialog {
  background-color: var(--surface);
  color: var(--neutral-900);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Em modo maximizado (mobile), preenche a tela e remove o radius. */
:global(.q-dialog__inner--maximized) .booking-form-dialog {
  max-width: 100%;
  height: 100%;
  border-radius: 0;
  padding: var(--space-4);
}

.booking-form-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.booking-form-dialog__close {
  background: transparent;
  border: none;
  color: var(--neutral-700);
  cursor: pointer;
  padding: var(--space-1);
  display: inline-flex;
  border-radius: var(--radius-sm);
}

.booking-form-dialog__close:hover {
  background-color: var(--neutral-100);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.booking-form__error {
  color: var(--danger);
}

.booking-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
