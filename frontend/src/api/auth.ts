import { refreshSession, request } from "./client";
import { clearSession, getCurrentUser, startSession, type AuthResponse } from "./session";

const WEB_CLIENT = "WEB";

export const authApi = {
  async login(email: string, password: string) {
    const session = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, client: WEB_CLIENT }),
    });
    startSession(session);
    return session.user;
  },
  async logout() {
    await request<void>("/auth/logout", { method: "POST" });
    clearSession();
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await request<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    clearSession();
  },
  async restoreSession() {
    if (getCurrentUser()) {
      return getCurrentUser();
    }
    return (await refreshSession()) ? getCurrentUser() : null;
  },
};
