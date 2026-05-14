<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
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
import { IconX } from "@tabler/icons-vue";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseInput from "@/shared/components/BaseInput.vue";
import type { Room } from "@/features/rooms/services/room.service";
import { useBookings, type BookingFormErrors } from "../composables/useBookings";

interface Props {
  modelValue: boolean;
  rooms: Room[];
  initialRoomId?: string;
}

const props = withDefaults(defineProps<Props>(), { initialRoomId: "" });
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
  form.startTime = "";
  form.endTime = "";
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
    submitError.value = extractErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Não foi possível criar a reserva.";
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
