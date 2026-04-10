"use client";

let authClientInstance: any = null;

async function getAuthClientInstance() {
  if (!authClientInstance) {
    try {
      const { createAuthClient } = await import("@neondatabase/auth/next");
      authClientInstance = createAuthClient();
    } catch (error) {
      console.error("Error initializing Neon Auth client:", error);
      throw error;
    }
  }
  return authClientInstance;
}

export const authClient = {
  signIn: {
    async email(data: any) {
      const client = await getAuthClientInstance();
      return client.signIn.email(data);
    },
    async social(data: any) {
      const client = await getAuthClientInstance();
      return client.signIn.social(data);
    },
  },
  signUp: {
    async email(data: any) {
      const client = await getAuthClientInstance();
      return client.signUp.email(data);
    },
  },
  async changePassword(data: any) {
    const client = await getAuthClientInstance();
    return client.changePassword(data);
  },
  async getSession() {
    const client = await getAuthClientInstance();
    return client.getSession();
  },
  emailOtp: {
    async verifyEmail(data: { email: string; otp: string }) {
      const client = await getAuthClientInstance();
      return client.emailOtp.verifyEmail(data);
    },
  },
  async sendVerificationEmail(data: { email: string; callbackURL?: string }) {
    const client = await getAuthClientInstance();
    return client.sendVerificationEmail(data);
  },
};

/**
 * Cierra la sesion navegando al endpoint server-side /api/auth/logout.
 * El server se encarga de invalidar la sesion upstream y borrar las cookies
 * HttpOnly (que no son accesibles desde JS), y luego redirige a /.
 */
export function logout() {
  window.location.href = "/api/auth/logout";
}

export async function fetchServerSession() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch (e) {
    console.error("[fetchServerSession] request failed", e);
    return null;
  }
}

export interface SessionFetchRetryOptions {
  attempts?: number;
  initialDelayMs?: number;
  multiplier?: number;
}

export async function fetchServerSessionWithRetry(
  options: SessionFetchRetryOptions = {},
) {
  const retries = options.attempts ?? 4;
  let delay = options.initialDelayMs ?? 200;
  const multiplier = options.multiplier ?? 1.5;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[fetchServerSessionWithRetry] attempt ${attempt + 1}`);
    }
    const session = await fetchServerSession();
    if (session) {
      if (process.env.NODE_ENV !== "production" && attempt > 0) {
        console.debug(
          `[fetchServerSessionWithRetry] secured session on attempt ${attempt + 1}`,
        );
      }
      return session;
    }

    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[fetchServerSessionWithRetry] attempt ${attempt + 1} did not return a session`,
      );
    }

    if (attempt < retries - 1) {
      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[fetchServerSessionWithRetry] attempt ${attempt + 1} failed, retrying in ${delay}ms`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * multiplier, 2000);
    }
  }

  return null;
}
