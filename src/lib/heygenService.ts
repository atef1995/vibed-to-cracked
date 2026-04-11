const LIVEAVATAR_API_BASE = "https://api.liveavatar.com/v1";

// Sandbox mode: only the Wayne avatar is available, no credits consumed
const SANDBOX_AVATAR = {
  avatarId: "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a", // Wayne (sandbox-only)
};

// Production avatars from LiveAvatar with their default voices
const INTERVIEW_AVATARS: Record<string, { avatarId: string; voiceId: string }> =
  {
    TECHNICAL: {
      avatarId: "64b526e4-741c-43b6-a918-4e40f3261c7a", // Bryan Tech Expert
      voiceId: "9c8b542a-bf5c-4f4c-9011-75c79a274387", // Bryan - Professional
    },
    BEHAVIORAL: {
      avatarId: "cd1d101c-9273-431b-8069-63beef736bec", // Judy HR
      voiceId: "4f3b1e99-b580-4f05-9b67-a5f585be0232", // Judy - Professional
    },
    MIXED: {
      avatarId: "64b526e4-741c-43b6-a918-4e40f3261c7a",
      voiceId: "9c8b542a-bf5c-4f4c-9011-75c79a274387",
    },
    default: {
      avatarId: "64b526e4-741c-43b6-a918-4e40f3261c7a",
      voiceId: "9c8b542a-bf5c-4f4c-9011-75c79a274387",
    },
  };

function getApiKey(): string {
  const key = process.env.LIVEAVATAR_API_KEY || process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("LIVEAVATAR_API_KEY is not configured");
  return key;
}

function isSandbox(): boolean {
  if (process.env.LIVEAVATAR_SANDBOX === "true") return true;
  if (process.env.LIVEAVATAR_SANDBOX === "false") return false;
  return process.env.NODE_ENV === "development";
}

export class HeyGenService {
  static async createAvatarSession(interviewType?: string) {
    const sandbox = isSandbox();
    const config =
      INTERVIEW_AVATARS[interviewType || ""] || INTERVIEW_AVATARS.default;

    const body: Record<string, unknown> = {
      avatar_id: sandbox ? SANDBOX_AVATAR.avatarId : config.avatarId,
      avatar_persona: {
        language: "en",
        ...(sandbox ? {} : { voice_id: config.voiceId }),
      },
      mode: "FULL",
      is_sandbox: sandbox,
      interactivity_type: "PUSH_TO_TALK",
    };

    const response = await fetch(`${LIVEAVATAR_API_BASE}/sessions/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": getApiKey(),
      },
      body: JSON.stringify(body),
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
