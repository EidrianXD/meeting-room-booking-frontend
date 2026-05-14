import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/features/bookings/services/booking.service", () => ({
  bookingService: {
    list: vi.fn(),
    create: vi.fn(),
    cancel: vi.fn(),
  },
}));

import { bookingService } from "@/features/bookings/services/booking.service";
import { useBookings } from "@/features/bookings/composables/useBookings";

const createMock = vi.mocked(bookingService.create);

const futureA = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const futureB = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

describe("useBookings.validate", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("retorna erro quando startTime está no passado", () => {
    const { validate, hasErrors } = useBookings();
    const past = new Date(Date.now() - 60 * 1000).toISOString();
    const errors = validate({
      title: "Stand-up",
      roomId: "r1",
      startTime: past,
      endTime: futureA,
    });
    expect(errors.startTime).toBe("O início não pode estar no passado");
    expect(hasErrors(errors)).toBe(true);
  });

  it("retorna erro quando startTime >= endTime", () => {
    const { validate, hasErrors } = useBookings();
    const errors = validate({
      title: "Stand-up",
      roomId: "r1",
      startTime: futureB,
      endTime: futureA,
    });
    expect(errors.endTime).toBe("O término deve ser depois do início");
    expect(hasErrors(errors)).toBe(true);
  });

  it("não retorna erros quando o input é válido", () => {
    const { validate, hasErrors } = useBookings();
    const errors = validate({
      title: "Stand-up",
      roomId: "r1",
      startTime: futureA,
      endTime: futureB,
    });
    expect(hasErrors(errors)).toBe(false);
  });
});

describe("useBookings.create", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    createMock.mockReset();
  });

  it("chama booking.service com os dados corretos em criação bem-sucedida", async () => {
    const payload = {
      title: "Stand-up",
      roomId: "r1",
      startTime: futureA,
      endTime: futureB,
    };
    const created = {
      id: "b1",
      userId: "u1",
      ...payload,
    };
    createMock.mockResolvedValue(created);

    const { create, bookings } = useBookings();
    const result = await create(payload);

    expect(createMock).toHaveBeenCalledWith(payload);
    expect(result).toEqual(created);
    expect(bookings.value).toContainEqual(created);
  });
});
