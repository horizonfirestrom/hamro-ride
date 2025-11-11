import api from "./http";

export type Role = "PASSENGER" | "DRIVER" | "ADMIN";

export interface LoginResp {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export async function login(email: string, password: string): Promise<LoginResp> {
  const { data } = await api.post<LoginResp>("/api/v1/auth/login", { email, password });
  return data;
}

export async function register(body: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  await api.post("/api/v1/auth/register", body);
}
