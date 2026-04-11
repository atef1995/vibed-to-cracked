import { DecartService } from "../decartService";

const MOCK_API_KEY = "test-decart-api-key";

describe("DecartService", () => {
  let originalFetch: typeof global.fetch;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      DECART_API_KEY: MOCK_API_KEY,
      DECART_DEFAULT_AVATAR_ID: "avatar-abc123",
    };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe("isConfigured", () => {
    it("returns true when DECART_API_KEY is set", () => {
      expect(DecartService.isConfigured()).toBe(true);
    });

    it("returns false when DECART_API_KEY is not set", () => {
      delete process.env.DECART_API_KEY;
      expect(DecartService.isConfigured()).toBe(false);
    });
  });

  describe("createAvatarSession", () => {
    it("creates a session with the default avatar when no company slug is given", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session_id: "sess-123",
          stream_url: "https://stream.decart.ai/sess-123",
        }),
      });

      const result = await DecartService.createAvatarSession();

      expect(result).toEqual({
        sessionId: "sess-123",
        streamUrl: "https://stream.decart.ai/sess-123",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.decart.ai/v1/sessions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_API_KEY}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ avatar_id: "avatar-abc123" }),
        })
      );
    });

    it("creates a session for a specific company slug", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session_id: "sess-456",
          stream_url: "https://stream.decart.ai/sess-456",
        }),
      });

      const result = await DecartService.createAvatarSession("amazon");

      expect(result.sessionId).toBe("sess-456");
      // Should fall back to default avatar since "amazon" is not mapped
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ avatar_id: "avatar-abc123" }),
        })
      );
    });

    it("throws when the API response is not ok", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => "Unauthorized",
      });

      await expect(DecartService.createAvatarSession()).rejects.toThrow(
        "Failed to create Decart avatar session"
      );
    });

    it("throws when DECART_API_KEY is missing", async () => {
      delete process.env.DECART_API_KEY;

      await expect(DecartService.createAvatarSession()).rejects.toThrow(
        "DECART_API_KEY is not configured"
      );
    });
  });

  describe("speak", () => {
    it("sends speech text to the Decart API", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await DecartService.speak("sess-123", "Hello, welcome to the interview!");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.decart.ai/v1/sessions/sess-123/speak",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_API_KEY}`,
          }),
          body: JSON.stringify({ text: "Hello, welcome to the interview!" }),
        })
      );
    });

    it("throws when the speak API returns an error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => "Bad request",
      });

      await expect(
        DecartService.speak("sess-123", "Hello")
      ).rejects.toThrow("Failed to send speech to Decart avatar");
    });

    it("throws when the session ID contains invalid characters", async () => {
      await expect(
        DecartService.speak("../../etc/passwd", "Hello")
      ).rejects.toThrow("Invalid session ID format");

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("closeSession", () => {
    it("sends a DELETE request to close the session", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await DecartService.closeSession("sess-123");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.decart.ai/v1/sessions/sess-123",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_API_KEY}`,
          }),
        })
      );
    });

    it("does not throw when the close API returns a non-ok response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      // Should resolve without throwing — only logs the error internally
      await DecartService.closeSession("sess-123");
    });

    it("throws when the session ID contains invalid characters", async () => {
      await expect(
        DecartService.closeSession("../../etc/passwd")
      ).rejects.toThrow("Invalid session ID format");

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
