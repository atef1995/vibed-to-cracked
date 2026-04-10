const HEYGEN_API_BASE = "https://api.heygen.com/v1";

// Default avatar IDs mapped to company styles
// These are placeholder HeyGen avatar IDs — replace with actual IDs from your HeyGen account
const COMPANY_AVATARS: Record<string, string> = {
  default: "josh_lite3_20230714",
};

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error("HEYGEN_API_KEY is not configured");
  return key;
}

export class HeyGenService {
  static async createAvatarSession(companySlug?: string) {
    const avatarId = COMPANY_AVATARS[companySlug || ""] || COMPANY_AVATARS.default;

    const response = await fetch(`${HEYGEN_API_BASE}/streaming.new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey(),
      },
      body: JSON.stringify({
        quality: "medium",
        avatar_name: avatarId,
        voice: { voice_id: "default" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("HeyGen session creation failed:", error);
      throw new Error("Failed to create avatar session");
    }

    const data = await response.json();
    return {
      sessionId: data.data?.session_id,
      accessToken: data.data?.access_token,
      url: data.data?.url,
    };
  }

  static async sendSpeakCommand(sessionId: string, text: string) {
    const response = await fetch(`${HEYGEN_API_BASE}/streaming.task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey(),
      },
      body: JSON.stringify({
        session_id: sessionId,
        text,
        task_type: "talk",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("HeyGen speak command failed:", error);
      throw new Error("Failed to send speak command");
    }

    return response.json();
  }

  static async closeSession(sessionId: string) {
    const response = await fetch(`${HEYGEN_API_BASE}/streaming.stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getApiKey(),
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      console.error("HeyGen session close failed");
    }
  }

  static isConfigured(): boolean {
    return !!process.env.HEYGEN_API_KEY;
  }
}
