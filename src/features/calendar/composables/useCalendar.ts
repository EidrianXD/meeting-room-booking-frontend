import type { EventInput } from "@fullcalendar/core";

export interface CalendarBooking {
  id: string;
  title: string;
  roomId: string;
  roomName?: string;
  startTime: string;
  endTime: string;
}

// Paleta de acentos baseada em tokens do design system. Passamos `var(--token)`
// para o FullCalendar — assim as cores adaptam automaticamente ao dark mode.
const ROOM_PALETTE = [
  "var(--brand-600)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--info)",
] as const;

function colorForRoom(roomId: string, roomOrder: string[]): string {
  const idx = roomOrder.indexOf(roomId);
  const slot = idx >= 0 ? idx % ROOM_PALETTE.length : 0;
  return ROOM_PALETTE[slot]!;
}

export function useCalendar() {
  function bookingsToEvents<T extends CalendarBooking>(
    bookings: T[],
    roomOrder: string[] = [],
  ): EventInput[] {
    return bookings.map((booking) => {
      const color = colorForRoom(booking.roomId, roomOrder);
      const label = booking.roomName
        ? `${booking.title} · ${booking.roomName}`
        : booking.title;
      return {
        id: booking.id,
        title: label,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: { booking },
      };
    });
  }

  return { bookingsToEvents };
}
