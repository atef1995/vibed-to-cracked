import OpenAI from "openai";

const VOICE_MAP: Record<string, string> = {
  TECHNICAL: "onyx",
  BEHAVIORAL: "nova",
  MIXED: "onyx",
  default: "alloy",
};

export class TTSService {
  static async generateSpeech(
    text: string,
    interviewType?: string
  ): Promise<ArrayBuffer> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const voice = VOICE_MAP[interviewType || ""] || VOICE_MAP.default;

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      response_format: "mp3",
    });

    return response.arrayBuffer();
  }

  static isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}
