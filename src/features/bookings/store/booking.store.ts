import { defineStore } from "pinia";
import { ref } from "vue";
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
      error.value = extractErrorMessage(err, "Não foi possível carregar as reservas.");
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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
