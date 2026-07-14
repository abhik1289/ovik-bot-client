export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  role: "USER" | "ADMIN";
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export function startGoogleLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  }
}

/** Loads the current user from the JWT cookie. Returns null when signed out. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("OVIKBOT_TOKEN")
        : null;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:8080/api/user/me", {
      method: "GET",
      headers: {
        authorization: "Bearer " + token,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch current user (${res.status})`);
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

/** Server-side helper: forwards the incoming cookie to the backend. */
export async function fetchCurrentUserFromCookie(
  cookieHeader: string | null,
): Promise<AuthUser | null> {
  try {
    const token = null; // server-side can't access browser localStorage
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      method: "GET",
      credentials: "include",
      headers,
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

/** Clears the cookie via the backend. Always resolves; never throws. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // best-effort
  }
}
