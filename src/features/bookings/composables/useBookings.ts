import { storeToRefs } from "pinia";
import { bookingService, type CreateBookingPayload } from "../services/booking.service";
import { useBookingStore } from "../store/booking.store";

export interface BookingFormErrors {
  title: string | null;
  roomId: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface BookingFormInput {
  title: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

export function useBookings() {
  const store = useBookingStore();
  const { bookings, loading, error } = storeToRefs(store);

  function validate(input: BookingFormInput): BookingFormErrors {
    const errors: BookingFormErrors = {
      title: null,
      roomId: null,
      startTime: null,
      endTime: null,
    };

    if (!input.title.trim()) errors.title = "Informe um título";
    if (!input.roomId) errors.roomId = "Selecione uma sala";

    if (!input.startTime) {
      errors.startTime = "Informe o início";
    } else if (new Date(input.startTime).getTime() < Date.now()) {
      errors.startTime = "O início não pode estar no passado";
    }

    if (!input.endTime) {
      errors.endTime = "Informe o término";
    } else if (
      input.startTime &&
      new Date(input.endTime).getTime() <= new Date(input.startTime).getTime()
    ) {
      errors.endTime = "O término deve ser depois do início";
    }

    return errors;
  }

  function hasErrors(errors: BookingFormErrors): boolean {
    return Object.values(errors).some((e) => e !== null);
  }

  async function create(payload: CreateBookingPayload) {
    const normalized: CreateBookingPayload = {
      ...payload,
      startTime: toIsoUtc(payload.startTime),
      endTime: toIsoUtc(payload.endTime),
    };
    const booking = await bookingService.create(normalized);
    store.addBooking(booking);
    return booking;
  }

  async function cancel(bookingId: string) {
    await bookingService.cancel(bookingId);
    store.removeBooking(bookingId);
  }

  // O input `datetime-local` retorna "YYYY-MM-DDTHH:mm" (sem timezone), que o
  // construtor de Date interpreta como horário local. Convertendo para ISO UTC
  // damos ao backend uma string ISO-8601 estrita (zod `.datetime()`).
  function toIsoUtc(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  return {
    bookings,
    loading,
    error,
    fetchAll: store.fetchAll,
    validate,
    hasErrors,
    create,
    cancel,
  };
}
