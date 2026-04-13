import { generateSimliSessionToken, SimliSessionRequest } from "simli-client";

const FACE_MAP: Record<string, string> = {
  TECHNICAL: process.env.SIMLI_FACE_ID_TECHNICAL || "",
  BEHAVIORAL: process.env.SIMLI_FACE_ID_BEHAVIORAL || "",
  default: process.env.SIMLI_FACE_ID || "",
};

function getFaceId(interviewType?: string): string {
  const mapped = FACE_MAP[interviewType || ""];
  return mapped || FACE_MAP.default;
}

export class SimliService {
  static isConfigured(): boolean {
    return !!process.env.SIMLI_API_KEY && !!process.env.SIMLI_FACE_ID;
  }

  static async createSessionToken(
    interviewType?: string
  ): Promise<{ sessionToken: string; faceId: string }> {
    const apiKey = process.env.SIMLI_API_KEY;
    if (!apiKey) throw new Error("SIMLI_API_KEY is not configured");

    const faceId = getFaceId(interviewType);
    if (!faceId) throw new Error("SIMLI_FACE_ID is not configured");

    const config: SimliSessionRequest = {
      faceId,
      handleSilence: true,
      maxSessionLength: 600,
      maxIdleTime: 180,
    };

    const { session_token } = await generateSimliSessionToken({
      apiKey,
      config,
    });

    return { sessionToken: session_token, faceId };
  }
}
