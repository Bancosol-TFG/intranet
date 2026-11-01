import { useMutation } from "@tanstack/react-query";
import { authApi } from "./authApi";

type Credentials = { email: string; password: string };
type PasswordChange = { currentPassword: string; newPassword: string };

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: Credentials) => authApi.login(email, password),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: PasswordChange) =>
      authApi.changePassword(currentPassword, newPassword),
  });
}
