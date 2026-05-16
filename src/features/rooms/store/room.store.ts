import { defineStore } from "pinia";
import { ref } from "vue";
import { toApiError } from "@/shared/api-error";
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
      error.value = toApiError(err, "Não foi possível carregar as salas.").message;
      rooms.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { rooms, loading, error, fetchRooms };
});
