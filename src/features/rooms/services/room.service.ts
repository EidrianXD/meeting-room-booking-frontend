import { http } from "@/shared/http";

export interface Room {
  id: string;
  name: string;
}

export const roomService = {
  async list(): Promise<Room[]> {
    const { data } = await http.get<Room[]>("/rooms");
    return data;
  },
};
