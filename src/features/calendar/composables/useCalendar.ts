import type { EventInput } from "@fullcalendar/core";
import type { Booking } from "@/features/bookings/services/booking.service";

// Paleta de acentos para diferenciar salas no calendário. Mapeada por índice
// para garantir cor estável entre renders sem depender da ordem do backend.
const ROOM_PALETTE = [
  { background: "#1a56a0", text: "#ffffff" }, // brand
  { background: "#1a7a4a", text: "#ffffff" }, // success
  { background: "#8a5700", text: "#ffffff" }, // warning
  { background: "#b91c1c", text: "#ffffff" }, // danger
  { background: "#5a4ec5", text: "#ffffff" }, // extra (caso entrem mais salas)
];

function colorForRoom(roomId: string, roomOrder: string[]) {
  const idx = roomOrder.indexOf(roomId);
  const slot = idx >= 0 ? idx % ROOM_PALETTE.length : 0;
  return ROOM_PALETTE[slot]!;
}

export function useCalendar() {
  function bookingsToEvents(bookings: Booking[], roomOrder: string[] = []): EventInput[] {
    return bookings.map((booking) => {
      const color = colorForRoom(booking.roomId, roomOrder);
      return {
        id: booking.id,
        title: booking.title,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: color.background,
        borderColor: color.background,
        textColor: color.text,
        extendedProps: { booking },
      };
    });
  }

  return { bookingsToEvents };
}
