const LIVEAVATAR_API_BASE = "https://api.liveavatar.com/v1";

// Default avatar IDs for LiveAvatar
// Replace with actual avatar IDs from your LiveAvatar account at app.liveavatar.com
const COMPANY_AVATARS: Record<string, string> = {
  default: "ef08839c-0d44-4c67-8e2b-cfb245e1a5b5",
};

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("HEYGEN_API_KEY is not configured");
  return key;
}

export class HeyGenService {
  static async createAvatarSession(companySlug?: string) {
    const avatarId =
      COMPANY_AVATARS[companySlug || ""] || COMPANY_AVATARS.default;

    const response = await fetch(`${LIVEAVATAR_API_BASE}/sessions/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": getApiKey(),
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        avatar_persona: {
          language: "en",
        },
        mode: "FULL",
        is_sandbox: process.env.NODE_ENV !== "production",
        interactivity_type: "PUSH_TO_TALK",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LiveAvatar session token creation failed:", error);
      throw new Error("Failed to create avatar session");
    }

    const result = await response.json();
    return {
      sessionId: result.data?.session_id,
      sessionToken: result.data?.session_token,
    };
  }

  static async closeSession(sessionId: string) {
    const response = await fetch(`${LIVEAVATAR_API_BASE}/sessions/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": getApiKey(),
      },
      body: JSON.stringify({
        session_id: sessionId,
        reason: "USER_CLOSED",
      }),
    });

    if (!response.ok) {
      console.error("LiveAvatar session close failed");
    }
  }

  static isConfigured(): boolean {
    return !!process.env.HEYGEN_API_KEY;
  }
}
