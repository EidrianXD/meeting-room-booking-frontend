<template>
  <q-page padding>
    <div class="page-container">
      <header class="page-header">
        <h1 class="text-heading-xl">Salas</h1>
        <p class="text-caption">Selecione uma sala disponível para criar uma reserva.</p>
      </header>

      <p v-if="loading" class="text-body">Carregando salas…</p>

      <BaseCard v-else-if="error" accent="danger">
        <p class="text-body">{{ error }}</p>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="refetch">Tentar novamente</BaseButton>
        </template>
      </BaseCard>

      <p v-else-if="rooms.length === 0" class="text-body">Nenhuma sala disponível no momento.</p>

      <div v-else class="rooms-grid">
        <RoomCard
          v-for="room in rooms"
          :key="room.id"
          :room="room"
          @reserve="onReserve"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import BaseButton from "@/shared/components/BaseButton.vue";
import BaseCard from "@/shared/components/BaseCard.vue";
import RoomCard from "@/features/rooms/components/RoomCard.vue";
import { useRoomStore } from "@/features/rooms/store/room.store";
import type { Room } from "@/features/rooms/services/room.service";

const router = useRouter();
const store = useRoomStore();
const { rooms, loading, error } = storeToRefs(store);

onMounted(() => {
  void store.fetchRooms();
});

function refetch() {
  void store.fetchRooms();
}

function onReserve(room: Room) {
  // BookingForm (Etapa 7) lerá ?roomId= para pré-selecionar a sala.
  void router.push({ name: "bookings", query: { roomId: room.id } });
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
</style>
