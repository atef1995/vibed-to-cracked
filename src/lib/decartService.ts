const DECART_API_BASE = "https://api.decart.ai/v1";

// Default avatar IDs for Decart
// Configure per-company avatar IDs via environment variables or the COMPANY_AVATARS map.
// Set DECART_DEFAULT_AVATAR_ID to the ID of your default avatar from the Decart dashboard.
const COMPANY_AVATARS: Record<string, string> = {
  default: process.env.DECART_DEFAULT_AVATAR_ID ?? "",
};

function getApiKey(): string {
  const key = process.env.DECART_API_KEY;
  if (!key) throw new Error("DECART_API_KEY is not configured");
  return key;
}

/** Validates a session ID to prevent SSRF via URL manipulation. */
function validateSessionId(sessionId: string): void {
  if (!/^[\w-]+$/.test(sessionId)) {
    throw new Error("Invalid session ID format");
  }
}

export class DecartService {
  static async createAvatarSession(companySlug?: string) {
    const avatarId =
      COMPANY_AVATARS[companySlug || ""] || COMPANY_AVATARS.default;

    const response = await fetch(`${DECART_API_BASE}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({ avatar_id: avatarId }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Decart session creation failed:", error);
      throw new Error("Failed to create Decart avatar session");
    }

    const result = await response.json();
    return {
      sessionId: result.session_id as string,
      streamUrl: result.stream_url as string,
    };
  }

  static async speak(sessionId: string, text: string) {
    validateSessionId(sessionId);
    const safeId = encodeURIComponent(sessionId);
    const response = await fetch(
      `${DECART_API_BASE}/sessions/${safeId}/speak`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Decart speak failed:", error);
      throw new Error("Failed to send speech to Decart avatar");
    }
  }

  static async closeSession(sessionId: string) {
    validateSessionId(sessionId);
    const safeId = encodeURIComponent(sessionId);
    const response = await fetch(
      `${DECART_API_BASE}/sessions/${safeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Decart session close failed");
    }
  }

  static isConfigured(): boolean {
    return !!process.env.DECART_API_KEY;
  }
}
