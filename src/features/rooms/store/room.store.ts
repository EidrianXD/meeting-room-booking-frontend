import { defineStore } from "pinia";
import { ref } from "vue";
import { roomService, type Room } from "../services/room.service";

export const useRoomStore = defineStore("rooms", () => {
  const rooms = ref<Room[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchRooms(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      rooms.value = await roomService.list();
    } catch (err: unknown) {
      error.value = extractErrorMessage(err);
      rooms.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { rooms, loading, error, fetchRooms };
});

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Não foi possível carregar as salas.";
}
