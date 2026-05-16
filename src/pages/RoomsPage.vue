<template>
  <q-page padding>
    <div class="page-container">
      <header class="page-header">
        <h1 class="text-heading-xl">Salas</h1>
        <p class="text-caption">Selecione uma sala disponível para criar uma reserva.</p>
      </header>

      <p v-if="loading" class="text-body state-message">Carregando salas…</p>

      <BaseCard v-else-if="error" accent="danger">
        <p class="text-body">{{ error }}</p>
        <template #footer>
          <BaseButton variant="secondary" size="sm" @click="refetch">Tentar novamente</BaseButton>
        </template>
      </BaseCard>

      <div v-else-if="rooms.length === 0" class="empty-state">
        <span class="empty-state__icon">
          <IconBuilding :size="28" stroke-width="1.75" />
        </span>
        <p class="text-heading-md empty-state__title">Nenhuma sala disponível</p>
        <p class="text-caption">Volte mais tarde ou consulte o administrador.</p>
      </div>

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
import { IconBuilding } from "@tabler/icons-vue";
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

.state-message {
  color: var(--neutral-700);
  text-align: center;
  padding: var(--space-5) 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-5);
  background-color: var(--surface);
  border: 1px dashed var(--neutral-300);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--brand-50);
  color: var(--brand-600);
  margin-bottom: var(--space-2);
}

.empty-state__title {
  margin: 0;
  color: var(--neutral-900);
}
</style>
