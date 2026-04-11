const LIVEAVATAR_API_BASE = "https://api.liveavatar.com/v1";

// Public avatar IDs from LiveAvatar
const INTERVIEW_AVATARS: Record<string, string> = {
  TECHNICAL: "64b526e4-741c-43b6-a918-4e40f3261c7a", // Bryan Tech Expert
  BEHAVIORAL: "cd1d101c-9273-431b-8069-63beef736bec", // Judy HR
  MIXED: "64b526e4-741c-43b6-a918-4e40f3261c7a", // Bryan Tech Expert for mixed
  default: "64b526e4-741c-43b6-a918-4e40f3261c7a",
};

function getApiKey(): string {
  const key = process.env.LIVEAVATAR_API_KEY || process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("LIVEAVATAR_API_KEY is not configured");
  return key;
}

export class HeyGenService {
  static async createAvatarSession(interviewType?: string) {
    const avatarId =
      INTERVIEW_AVATARS[interviewType || ""] || INTERVIEW_AVATARS.default;

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
    return !!(process.env.LIVEAVATAR_API_KEY || process.env.HEYGEN_API_KEY);
  }
}
