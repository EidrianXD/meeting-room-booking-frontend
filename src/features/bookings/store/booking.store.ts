import { defineStore } from "pinia";
import { ref } from "vue";
import { toApiError } from "@/shared/api-error";
import { bookingService, type Booking } from "../services/booking.service";

export const useBookingStore = defineStore("bookings", () => {
  const bookings = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      bookings.value = await bookingService.list();
    } catch (err: unknown) {
      error.value = toApiError(err, "Não foi possível carregar as reservas.").message;
      bookings.value = [];
    } finally {
      loading.value = false;
    }
  }

  function addBooking(booking: Booking): void {
    bookings.value = [...bookings.value, booking];
  }

  function removeBooking(bookingId: string): void {
    bookings.value = bookings.value.filter((b) => b.id !== bookingId);
  }

  return { bookings, loading, error, fetchAll, addBooking, removeBooking };
});
