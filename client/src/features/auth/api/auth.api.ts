import { authClient } from "@/shared/lib/auth-client";

import type {
  LoginFormData,
  RegisterFormData,
} from "../types";

export const authApi = {
  login: async (data: LoginFormData) => {
    return authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
  },

  register: async (data: RegisterFormData) => {
    return authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  },

  logout: async () => {
    return authClient.signOut();
  },

  getSession: async () => {
    return authClient.getSession();
  },
};