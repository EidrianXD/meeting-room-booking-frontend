import { http } from "@/shared/http";

export interface Booking {
  id: string;
  title: string;
  roomId: string;
  roomName?: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime: string;
}

export interface CreateBookingPayload {
  title: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

export const bookingService = {
  async list(): Promise<Booking[]> {
    const { data } = await http.get<Booking[]>("/bookings");
    return data;
  },

  async create(payload: CreateBookingPayload): Promise<Booking> {
    const { data } = await http.post<Booking>("/bookings", payload);
    return data;
  },

  async cancel(bookingId: string): Promise<void> {
    await http.delete(`/bookings/${bookingId}`);
  },
};
