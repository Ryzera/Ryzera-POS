import api from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth.types";

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", credentials);
  return res.data.data;
};
