export type CurrentUser = {
  id: number;
  email: string;
  firstName: string;
  surname: string | null;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
};

export type AuthResponse = {
  accessToken: string;
  expiresIn: number;
  user: CurrentUser;
};

let accessToken: string | null = null;
let currentUser: CurrentUser | null = null;

export function getAccessToken() {
  return accessToken;
}

export function getCurrentUser() {
  return currentUser;
}

export function startSession(session: AuthResponse) {
  accessToken = session.accessToken;
  currentUser = session.user;
}

export function clearSession() {
  accessToken = null;
  currentUser = null;
}
