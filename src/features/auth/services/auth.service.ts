import { http } from "@/shared/http";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>("/auth/login", credentials);
    return data;
  },
};
