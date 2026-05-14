import { describe, expect, it } from "vitest";
import { useCalendar } from "@/features/calendar/composables/useCalendar";
import type { Booking } from "@/features/bookings/services/booking.service";

const sample: Booking = {
  id: "b1",
  title: "Sprint planning",
  roomId: "r1",
  roomName: "Sala A",
  userId: "u1",
  userName: "Alice",
  startTime: "2030-01-01T09:00:00",
  endTime: "2030-01-01T10:00:00",
};

describe("useCalendar.bookingsToEvents", () => {
  it("mapeia Booking[] para o formato de eventos do FullCalendar", () => {
    const { bookingsToEvents } = useCalendar();
    const events = bookingsToEvents([sample], ["r1"]);

    expect(events).toHaveLength(1);
    const ev = events[0]!;
    expect(ev.id).toBe(sample.id);
    expect(ev.title).toBe(sample.title);
    expect(ev.start).toBe(sample.startTime);
    expect(ev.end).toBe(sample.endTime);
    expect(ev.backgroundColor).toBeDefined();
    expect(ev.extendedProps).toEqual({ booking: sample });
  });

  it("aplica a mesma cor para reservas da mesma sala", () => {
    const { bookingsToEvents } = useCalendar();
    const events = bookingsToEvents(
      [sample, { ...sample, id: "b2" }],
      ["r1"],
    );
    expect(events[0]!.backgroundColor).toBe(events[1]!.backgroundColor);
  });

  it("aplica cores diferentes para salas diferentes", () => {
    const { bookingsToEvents } = useCalendar();
    const events = bookingsToEvents(
      [sample, { ...sample, id: "b2", roomId: "r2" }],
      ["r1", "r2"],
    );
    expect(events[0]!.backgroundColor).not.toBe(events[1]!.backgroundColor);
  });
});
