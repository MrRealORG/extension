/* Shared, dependency-free validation and configuration. No remote code or services. */
(function (root) {
  const VERSION = "1.1.0";
  const SITES = [
    {
      id: "chatgpt",
      name: "ChatGPT",
      host: "chatgpt.com",
      url: "https://chatgpt.com",
      domains: ["chatgpt.com", "chat.openai.com"],
      mark: "✳",
      color: "#263c34",
    },
    {
      id: "gemini",
      name: "Gemini",
      host: "gemini.google.com",
      url: "https://gemini.google.com",
      domains: ["gemini.google.com"],
      mark: "✦",
      color: "#4b85e4",
    },
    {
      id: "claude",
      name: "Claude",
      host: "claude.ai",
      url: "https://claude.ai",
      domains: ["claude.ai"],
      mark: "✺",
      color: "#c77c5e",
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      host: "chat.deepseek.com",
      url: "https://chat.deepseek.com",
      domains: ["chat.deepseek.com"],
      mark: "≈",
      color: "#4c6ee8",
    },
    {
      id: "arena",
      name: "Arena",
      host: "arena.ai",
      url: "https://arena.ai",
      domains: ["arena.ai", "lmarena.ai"],
      mark: "▧",
      color: "#272a30",
    },
    {
      id: "qwen",
      name: "Qwen",
      host: "chat.qwen.ai",
      url: "https://chat.qwen.ai",
      domains: ["chat.qwen.ai", "chat.qwenlm.ai"],
      mark: "❋",
      color: "#805ae2",
    },
    {
      id: "kimi",
      name: "Kimi",
      host: "kimi.com",
      url: "https://www.kimi.com",
      domains: ["kimi.com", "www.kimi.com", "kimi.moonshot.cn"],
      mark: "K",
      color: "#242a30",
    },
    {
      id: "zai",
      name: "Z.ai / GLM",
      host: "chat.z.ai",
      url: "https://chat.z.ai",
      domains: ["chat.z.ai", "chatglm.cn"],
      mark: "Z",
      color: "#4567e2",
    },
    {
      id: "grok",
      name: "Grok",
      host: "grok.com",
      url: "https://grok.com",
      domains: ["grok.com"],
      mark: "𝕏",
      color: "#292a30",
    },
    {
      id: "perplexity",
      name: "Perplexity",
      host: "perplexity.ai",
      url: "https://www.perplexity.ai",
      domains: ["www.perplexity.ai", "perplexity.ai"],
      mark: "⊹",
      color: "#25898d",
    },
    {
      id: "copilot",
      name: "Copilot",
      host: "copilot.microsoft.com",
      url: "https://copilot.microsoft.com",
      domains: ["copilot.microsoft.com"],
      mark: "◈",
      color: "#508fb8",
    },
    {
      id: "mistral",
      name: "Le Chat",
      host: "chat.mistral.ai",
      url: "https://chat.mistral.ai",
      domains: ["chat.mistral.ai"],
      mark: "M",
      color: "#dc813b",
    },
    {
      id: "poe",
      name: "Poe",
      host: "poe.com",
      url: "https://poe.com",
      domains: ["poe.com"],
      mark: "P",
      color: "#7860bc",
    },
  ];
  const PRESETS = [
    {
      id: "lavender",
      name: "Lavender haze",
      description: "A softer state of mind",
      tag: "POPULAR",
      bg: "#f1edf8",
      surface: "#fcfaff",
      sidebar: "#e9e2f3",
      text: "#342b48",
      muted: "#81758f",
      accent: "#9575cd",
      border: "#ded4ec",
      dark: false,
    },
    {
      id: "midnight",
      name: "Midnight ink",
      description: "For your after-hours ideas",
      tag: "DARK",
      bg: "#171b24",
      surface: "#222733",
      sidebar: "#1d222d",
      text: "#e3e7f0",
      muted: "#919aae",
      accent: "#889aeb",
      border: "#353e50",
      dark: true,
    },
    {
      id: "matcha",
      name: "Matcha moments",
      description: "A little room to breathe",
      tag: "",
      bg: "#eef1e8",
      surface: "#f9fbf6",
      sidebar: "#e3e9da",
      text: "#354132",
      muted: "#798473",
      accent: "#839873",
      border: "#d5ddcb",
      dark: false,
    },
    {
      id: "rose",
      name: "Rosewater",
      description: "A warm kind of wonderful",
      tag: "",
      bg: "#f7edef",
      surface: "#fff9fa",
      sidebar: "#f0dfe4",
      text: "#53363f",
      muted: "#9b7884",
      accent: "#cc8c9f",
      border: "#ead1d9",
      dark: false,
    },
    {
      id: "ocean",
      name: "Ocean air",
      description: "Find your flow",
      tag: "",
      bg: "#eaf1f6",
      surface: "#f8fcff",
      sidebar: "#dce8f1",
      text: "#2e485b",
      muted: "#758ea2",
      accent: "#6d9ebd",
      border: "#ccdde9",
      dark: false,
    },
    {
      id: "peach",
      name: "Golden hour",
      description: "Keep the good light around",
      tag: "",
      bg: "#faf1e7",
      surface: "#fffcf7",
      sidebar: "#f3e4d4",
      text: "#624a36",
      muted: "#a08a76",
      accent: "#d6a373",
      border: "#ebd9c6",
      dark: false,
    },
  ];
  const FONT_MAP = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    rounded: '"Trebuchet MS", "Arial Rounded MT Bold", sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  };
  const DEFAULT_THEME = {
    ...PRESETS[0],
    font: "system",
    wallpaper: "dunes",
    wallpaperData: "",
    opacity: 85,
    blur: 12,
    dim: 8,
    glass: true,
    preserveCode: true,
  };
  const DEFAULT_AUTOMATION = {
    mode: "manual",
    dayStart: "07:00",
    nightStart: "19:00",
    dayTheme: "preset:lavender",
    nightTheme: "preset:midnight",
  };
  const DEFAULT_STATE = {
    version: 1,
    enabled: true,
    theme: DEFAULT_THEME,
    sites: {},
    customSites: [],
    siteThemes: {},
    profiles: [],
    automation: DEFAULT_AUTOMATION,
  };
  const isHex = (v) => typeof v === "string" && /^#[\da-f]{6}$/i.test(v);
  const clamp = (v, min, max, fallback) =>
    Number.isFinite(Number(v))
      ? Math.max(min, Math.min(max, Number(v)))
      : fallback;
  function sanitizeTheme(raw = {}) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};
    const t = { ...DEFAULT_THEME };
    for (const k of [
      "bg",
      "surface",
      "sidebar",
      "text",
      "muted",
      "accent",
      "border",
    ])
      if (isHex(raw[k])) t[k] = raw[k];
    for (const k of ["dark", "glass", "preserveCode"])
      if (typeof raw[k] === "boolean") t[k] = raw[k];
    for (const k of ["id", "name"])
      if (typeof raw[k] === "string") t[k] = raw[k].slice(0, 80);
    if (Object.hasOwn(FONT_MAP, raw.font)) t.font = raw.font;
    if (["none", "dunes", "aurora", "coast", "custom"].includes(raw.wallpaper))
      t.wallpaper = raw.wallpaper;
    if (
      typeof raw.wallpaperData === "string" &&
      raw.wallpaperData.length <= 4200000 &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(
        raw.wallpaperData,
      )
    )
      t.wallpaperData = raw.wallpaperData;
    t.opacity = clamp(raw.opacity, 25, 100, DEFAULT_THEME.opacity);
    t.blur = clamp(raw.blur, 0, 30, DEFAULT_THEME.blur);
    t.dim = clamp(raw.dim, 0, 70, DEFAULT_THEME.dim);
    return t;
  }
  function sanitizeHost(v) {
    try {
      const u = new URL(v.includes("://") ? v : `https://${v}`);
      if (
        u.protocol !== "https:" ||
        u.port ||
        u.username ||
        u.password ||
        !u.hostname.includes(".") ||
        !/^[a-z0-9.-]+$/.test(u.hostname)
      )
        return null;
      return u.hostname.toLowerCase();
    } catch {
      return null;
    }
  }
  function sanitizeState(raw = {}) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};
    const s = {
      ...DEFAULT_STATE,
      theme: sanitizeTheme(raw.theme),
      sites: {},
      customSites: [],
      siteThemes: {},
      profiles: [],
    };
    s.enabled = raw.enabled !== false;
    if (Array.isArray(raw.customSites))
      s.customSites = [
        ...new Set(
          raw.customSites
            .filter((v) => typeof v === "string")
            .map(sanitizeHost)
            .filter(Boolean),
        ),
      ].slice(0, 100);
    const keys = [...SITES.map((s) => s.id), ...s.customSites];
    for (const k of keys) {
      s.sites[k] = raw.sites?.[k] === true;
      if (raw.siteThemes?.[k])
        s.siteThemes[k] = sanitizeTheme(raw.siteThemes[k]);
    }
    if (Array.isArray(raw.profiles))
      s.profiles = raw.profiles
        .slice(0, 50)
        .filter(
          (p) => p && typeof p.name === "string" && typeof p.id === "string",
        )
        .map((p) => ({
          id: p.id.slice(0, 80),
          name: p.name.slice(0, 60),
          theme: sanitizeTheme(p.theme),
        }));
    s.profiles = s.profiles.filter(
      (p, index, all) =>
        p.id.trim() &&
        p.name.trim() &&
        all.findIndex((other) => other.id === p.id) === index,
    );
    s.automation = sanitizeAutomation(raw.automation, s.profiles);
    return s;
  }
  function sanitizeAutomation(raw = {}, profiles = []) {
    const result = { ...DEFAULT_AUTOMATION };
    if (!raw || typeof raw !== "object") return result;
    if (["manual", "system", "schedule"].includes(raw.mode))
      result.mode = raw.mode;
    for (const key of ["dayStart", "nightStart"])
      if (
        typeof raw[key] === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(raw[key])
      )
        result[key] = raw[key];
    if (result.dayStart === result.nightStart) {
      result.dayStart = DEFAULT_AUTOMATION.dayStart;
      result.nightStart = DEFAULT_AUTOMATION.nightStart;
    }
    const refs = new Set([
      ...PRESETS.map((p) => `preset:${p.id}`),
      ...profiles.map((p) => `profile:${p.id}`),
    ]);
    for (const key of ["dayTheme", "nightTheme"])
      if (refs.has(raw[key])) result[key] = raw[key];
    return result;
  }
  function automationPeriod(automation, date = new Date(), systemDark = false) {
    if (automation.mode === "manual") return "manual";
    if (automation.mode === "system") return systemDark ? "night" : "day";
    const minutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const now = date.getHours() * 60 + date.getMinutes(),
      day = minutes(automation.dayStart),
      night = minutes(automation.nightStart);
    return (day < night ? now >= day && now < night : now >= day || now < night)
      ? "day"
      : "night";
  }
  function resolveTheme(
    state,
    { site = null, date = new Date(), systemDark = false } = {},
  ) {
    if (site && state.siteThemes[site]) return state.siteThemes[site];
    const automation = sanitizeAutomation(state.automation, state.profiles);
    const period = automationPeriod(automation, date, systemDark);
    if (period === "manual") return state.theme;
    const ref = automation[`${period}Theme`];
    if (ref.startsWith("profile:"))
      return (
        state.profiles.find((p) => `profile:${p.id}` === ref)?.theme ||
        state.theme
      );
    const preset = PRESETS.find((p) => `preset:${p.id}` === ref);
    return sanitizeTheme({ ...state.theme, ...preset });
  }
  // Repair only solid-color foreground/background pairs; wallpaper contrast is variable.
  function readablePalette(theme) {
    const t = sanitizeTheme(theme),
      surfaces = [t.bg, t.surface, t.sidebar];
    const minimum = (color) =>
      Math.min(...surfaces.map((bg) => contrast(color, bg)));
    const candidates = ["#17151c", "#ffffff"];
    let best = candidates.sort((a, b) => minimum(b) - minimum(a))[0];
    if (minimum(best) < 4.5) {
      for (let v = 0; v < 256; v++) {
        const gray = `#${v.toString(16).padStart(2, "0").repeat(3)}`;
        if (minimum(gray) > minimum(best)) best = gray;
      }
    }
    const patch = {};
    for (const key of ["text", "muted", "accent"])
      if (minimum(t[key]) < 4.5 && minimum(best) > minimum(t[key]))
        patch[key] = best;
    return {
      patch,
      minimum: minimum(patch.text || t.text),
      mixedSurfaces: minimum(best) < 4.5,
    };
  }
  function siteForHost(host, state) {
    return (
      SITES.find((s) => s.domains.includes(host))?.id ||
      (state.customSites.includes(host) ? host : null)
    );
  }
  function originsFor(id) {
    const s = SITES.find((s) => s.id === id);
    return (s ? s.domains : [id]).map((d) => `https://${d}/*`);
  }
  function rgba(hex, alpha) {
    return `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${alpha})`;
  }
  function contrast(a, b) {
    const lum = (c) => {
      const rgb = c
        .slice(1)
        .match(/../g)
        .map((x) => parseInt(x, 16) / 255)
        .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const x = lum(a),
      y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  const api = {
    VERSION,
    SITES,
    PRESETS,
    FONT_MAP,
    DEFAULT_THEME,
    DEFAULT_STATE,
    DEFAULT_AUTOMATION,
    sanitizeAutomation,
    automationPeriod,
    resolveTheme,
    readablePalette,
    sanitizeTheme,
    sanitizeState,
    sanitizeHost,
    siteForHost,
    originsFor,
    rgba,
    contrast,
    isHex,
  };
  root.DreamCore = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
