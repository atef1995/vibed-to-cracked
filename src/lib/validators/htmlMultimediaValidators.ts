/**
 * HTML Multimedia — Exercise Validators
 * Steps for the html-multimedia tutorial.
 */

type ValidateFn = (
  html: string,
  css: string,
  js: string,
  iframeWindow?: Window | null
) => boolean | Promise<boolean>;

export const htmlMultimediaValidators: Record<
  string,
  Record<string, ValidateFn>
> = {
  // ── Step 1: Image Basics ──────────────────────────────────────────

  "html-multimedia-step-01": {
    "has-img-src": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("img");
      return img !== null && img.getAttribute("src") === "landscape.jpg";
    },
    "has-alt-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("img");
      return (
        img !== null && img.getAttribute("alt") === "Mountain trail at sunrise"
      );
    },
    "has-dimensions": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("img");
      if (!img) return false;
      return (
        img.getAttribute("width") === "640" &&
        img.getAttribute("height") === "360"
      );
    },
    "has-lazy": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("img");
      return img !== null && img.getAttribute("loading") === "lazy";
    },
  },

  // ── Step 2: Responsive Images ─────────────────────────────────────

  "html-multimedia-step-02": {
    "has-picture": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("picture") !== null;
    },
    "has-mobile-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("picture source");
      return Array.from(sources).some((s) => {
        const media = s.getAttribute("media") || "";
        const srcset = s.getAttribute("srcset") || "";
        return media.includes("600") && srcset.includes("w=400");
      });
    },
    "has-tablet-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("picture source");
      return Array.from(sources).some((s) => {
        const media = s.getAttribute("media") || "";
        const srcset = s.getAttribute("srcset") || "";
        return media.includes("1200") && srcset.includes("w=800");
      });
    },
    "has-fallback-img": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("picture img");
      if (!img) return false;
      return (
        (img.getAttribute("src") || "").includes("w=1200") &&
        (img.getAttribute("alt") || "").length > 0
      );
    },
  },

  // ── Step 3: Image Formats ─────────────────────────────────────────

  "html-multimedia-step-03": {
    "has-avif-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("picture source");
      return Array.from(sources).some((s) => {
        return (
          s.getAttribute("type") === "image/avif" &&
          (s.getAttribute("srcset") || "").includes("fm=avif")
        );
      });
    },
    "has-webp-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("picture source");
      return Array.from(sources).some((s) => {
        return (
          s.getAttribute("type") === "image/webp" &&
          (s.getAttribute("srcset") || "").includes("fm=webp")
        );
      });
    },
    "has-jpeg-fallback": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("picture img");
      if (!img) return false;
      return (
        (img.getAttribute("src") || "").includes("fm=jpg") &&
        (img.getAttribute("alt") || "").length > 0
      );
    },
  },

  // ── Step 4: Figure and Caption ────────────────────────────────────

  "html-multimedia-step-04": {
    "has-figure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("figure") !== null;
    },
    "has-img-in-figure": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("figure img");
      if (!img) return false;
      return (
        (img.getAttribute("src") || "").includes("unsplash.com") &&
        (img.getAttribute("alt") || "").length > 0
      );
    },
    "has-figcaption": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cap = iframeWindow.document.querySelector("figure figcaption");
      return cap !== null && (cap.textContent || "").trim().length > 0;
    },
  },

  // ── Step 5: The Video Element ─────────────────────────────────────

  "html-multimedia-step-05": {
    "has-video-controls": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const video = iframeWindow.document.querySelector("video");
      return video !== null && video.hasAttribute("controls");
    },
    "has-poster": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const video = iframeWindow.document.querySelector("video");
      return (
        video !== null &&
        (video.getAttribute("poster") || "").includes("unsplash.com")
      );
    },
    "has-video-sources": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("video source");
      const types = Array.from(sources).map((s) => s.getAttribute("type"));
      const srcs = Array.from(sources).map((s) => s.getAttribute("src") || "");
      return (
        types.includes("video/mp4") &&
        types.includes("video/webm") &&
        srcs.some((s) => s.includes(".mp4")) &&
        srcs.some((s) => s.includes(".webm"))
      );
    },
  },

  // ── Step 6: Video Tracks ──────────────────────────────────────────

  "html-multimedia-step-06": {
    "has-video-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const source = iframeWindow.document.querySelector("video source");
      return (
        source !== null &&
        (source.getAttribute("src") || "").includes(".mp4") &&
        source.getAttribute("type") === "video/mp4"
      );
    },
    "has-captions-track": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const track = iframeWindow.document.querySelector(
        'video track[kind="captions"]'
      );
      if (!track) return false;
      const src = track.getAttribute("src") || "";
      return src.includes(".vtt") || src.startsWith("data:text/vtt");
    },
    "has-track-attrs": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const track = iframeWindow.document.querySelector(
        'video track[kind="captions"]'
      );
      if (!track) return false;
      return (
        track.getAttribute("srclang") === "en" &&
        (track.getAttribute("label") || "").length > 0 &&
        track.hasAttribute("default")
      );
    },
  },

  // ── Step 7: The Audio Element ─────────────────────────────────────

  "html-multimedia-step-07": {
    "has-audio-controls": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const audio = iframeWindow.document.querySelector("audio");
      return audio !== null && audio.hasAttribute("controls");
    },
    "has-preload": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const audio = iframeWindow.document.querySelector("audio");
      return audio !== null && audio.getAttribute("preload") === "metadata";
    },
    "has-audio-sources": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const sources = iframeWindow.document.querySelectorAll("audio source");
      const types = Array.from(sources).map((s) => s.getAttribute("type"));
      return types.includes("audio/mpeg") && types.includes("audio/ogg");
    },
  },

  // ── Step 8: Embedding External Media ──────────────────────────────

  "html-multimedia-step-08": {
    "has-iframe-src": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const iframe = iframeWindow.document.querySelector("iframe");
      return (
        iframe !== null &&
        iframe.getAttribute("src") ===
          "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
      );
    },
    "has-iframe-title": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const iframe = iframeWindow.document.querySelector("iframe");
      return iframe !== null && (iframe.getAttribute("title") || "").length > 0;
    },
    "has-allowfullscreen": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const iframe = iframeWindow.document.querySelector("iframe");
      return iframe !== null && iframe.hasAttribute("allowfullscreen");
    },
  },

  // ── Step 9: Multimedia Accessibility ──────────────────────────────

  "html-multimedia-step-09": {
    "has-descriptive-alt": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const img = iframeWindow.document.querySelector("img");
      if (!img) return false;
      const alt = img.getAttribute("alt") || "";
      return alt.length > 20 && alt.toLowerCase().includes("chart");
    },
    "has-figure-wrapper": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      return iframeWindow.document.querySelector("figure img") !== null;
    },
    "has-caption-text": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const cap = iframeWindow.document.querySelector("figure figcaption");
      return cap !== null && (cap.textContent || "").trim().length > 5;
    },
  },

  // ── Step 10: Multimedia Gallery ───────────────────────────────────

  "html-multimedia-step-10": {
    "has-figure-with-img": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const fig = iframeWindow.document.querySelector("figure");
      if (!fig) return false;
      const img = fig.querySelector("img");
      const cap = fig.querySelector("figcaption");
      return (
        img !== null &&
        (img.getAttribute("alt") || "").length > 0 &&
        cap !== null &&
        (cap.textContent || "").trim().length > 0
      );
    },
    "has-video-with-track": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const video = iframeWindow.document.querySelector("video");
      if (!video || !video.hasAttribute("controls")) return false;
      const source = video.querySelector("source");
      const track = video.querySelector('track[kind="captions"]');
      return source !== null && track !== null;
    },
    "has-audio-with-source": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const audio = iframeWindow.document.querySelector("audio");
      if (!audio || !audio.hasAttribute("controls")) return false;
      return audio.querySelector("source") !== null;
    },
    "has-section-wrapper": (_html, _css, _js, iframeWindow): boolean => {
      if (!iframeWindow) return false;
      const section = iframeWindow.document.querySelector("section");
      if (!section) return false;
      return (
        section.querySelector("figure") !== null &&
        section.querySelector("video") !== null &&
        section.querySelector("audio") !== null
      );
    },
  },
};
