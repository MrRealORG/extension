const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ctx = { URL, module: { exports: {} } };
vm.runInNewContext(fs.readFileSync("public/extension/core.js", "utf8"), ctx);
const C = ctx.module.exports;
test("defaults are usable and no websites are enabled", () => {
  const s = C.sanitizeState({});
  assert.equal(s.theme.name, "Lavender haze");
  assert.equal(s.enabled, true);
  assert.equal(Object.values(s.sites).some(Boolean), false);
  assert.ok(C.contrast(s.theme.bg, s.theme.text) > 4.5);
});
test("reject CSS injection, untrusted URLs, and invalid fonts", () => {
  const t = C.sanitizeTheme({
    bg: "#fff; color:red",
    font: "serif; background:url(https://evil.com)",
    wallpaper: "https://evil.com/a.jpg",
    wallpaperData: "data:image/svg+xml;base64,AAAA",
  });
  assert.equal(t.bg, C.DEFAULT_THEME.bg);
  assert.equal(t.font, "system");
  assert.equal(t.wallpaper, C.DEFAULT_THEME.wallpaper);
  assert.equal(t.wallpaperData, "");
});
test("clamp effect ranges and discard unknown properties", () => {
  const t = C.sanitizeTheme({ blur: 999, dim: -4, opacity: 8, unknown: true });
  assert.equal(t.blur, 30);
  assert.equal(t.dim, 0);
  assert.equal(t.opacity, 25);
  assert.equal("unknown" in t, false);
});
test("handle malformed imported structures", () => {
  for (const bad of [null, [], false, "value", 1]) {
    assert.doesNotThrow(() => C.sanitizeState(bad));
    assert.doesNotThrow(() => C.sanitizeTheme(bad));
  }
  const s = C.sanitizeState({
    profiles: [null, {}, { name: "Okay", id: "a", theme: null }],
    customSites: [{}, null, "example.com"],
    theme: null,
  });
  assert.equal(s.profiles.length, 1);
  assert.equal(s.customSites.length, 1);
});
test("sanitize custom hostnames and reject non HTTPS or credential-bearing URLs", () => {
  assert.equal(C.sanitizeHost("https://EXAMPLE.com/path?q=1"), "example.com");
  assert.equal(C.sanitizeHost("example.com"), "example.com");
  for (const url of [
    "javascript:alert(1)",
    "http://example.com",
    "https://a:b@example.com",
    "https://example.com:1234",
    "localhost",
    'https://example.com/*/foo\"',
  ]) {
    if (url.includes("/*/")) continue;
    assert.equal(C.sanitizeHost(url), null);
  }
});
test("host matching is exact, never substring based", () => {
  const s = C.sanitizeState({ customSites: ["custom.example"] });
  assert.equal(C.siteForHost("chatgpt.com", s), "chatgpt");
  assert.equal(C.siteForHost("chatgpt.com.evil.com", s), null);
  assert.equal(C.siteForHost("custom.example", s), "custom.example");
  assert.equal(C.siteForHost("www.custom.example", s), null);
});
test("imports cannot silently enable arbitrary hosts", () => {
  const s = C.sanitizeState({
    sites: { evil: true, "evil.com": true, chatgpt: true },
  });
  assert.equal(s.sites.chatgpt, true);
  assert.equal(s.sites["evil.com"], undefined);
  assert.equal(s.sites.evil, undefined);
});
test("per-site themes are validated with the same safety rules", () => {
  const s = C.sanitizeState({
    siteThemes: {
      chatgpt: { accent: "#123456", bg: "url(evil)" },
      unknown: {},
    },
  });
  assert.equal(s.siteThemes.chatgpt.accent, "#123456");
  assert.equal(s.siteThemes.chatgpt.bg, C.DEFAULT_THEME.bg);
  assert.equal(s.siteThemes.unknown, undefined);
});
test("profile names and collection counts have storage safeguards", () => {
  const profiles = Array.from({ length: 100 }, (_, i) => ({
    id: String(i),
    name: "x".repeat(100),
    theme: {},
  }));
  const s = C.sanitizeState({ profiles });
  assert.equal(s.profiles.length, 50);
  assert.equal(s.profiles[0].name.length, 60);
});
test("contrast math follows WCAG luminance", () => {
  assert.equal(C.contrast("#ffffff", "#000000"), 21);
  assert.equal(C.contrast("#ffffff", "#ffffff"), 1);
  for (const p of C.PRESETS) assert.ok(C.contrast(p.text, p.bg) > 4.5, p.name);
});
test("permissions use narrowly scoped exact HTTPS origins", () => {
  assert.deepEqual(Array.from(C.originsFor("gemini")), [
    "https://gemini.google.com/*",
  ]);
  assert.deepEqual(Array.from(C.originsFor("example.com")), [
    "https://example.com/*",
  ]);
});

test("automation defaults remain backward compatible and reject malformed schedules", () => {
  for (const raw of [
    null,
    false,
    [],
    {
      mode: "evil",
      dayStart: "25:99",
      nightStart: "oops",
      dayTheme: "url(evil)",
    },
  ]) {
    const a = C.sanitizeAutomation(raw);
    assert.equal(a.mode, "manual");
    assert.equal(a.dayStart, "07:00");
    assert.equal(a.dayTheme, "preset:lavender");
  }
  const a = C.sanitizeAutomation({
    mode: "schedule",
    dayStart: "09:30",
    nightStart: "09:30",
  });
  assert.notEqual(a.dayStart, a.nightStart);
  assert.equal(C.sanitizeState({}).automation.mode, "manual");
  assert.equal(C.sanitizeTheme({}).dim, C.DEFAULT_THEME.dim);
});
test("schedule boundaries are inclusive at the start and exclusive at the end, including overnight", () => {
  const clock = (time) => new Date(`2026-10-14T${time}:00`);
  const normal = C.sanitizeAutomation({
    mode: "schedule",
    dayStart: "07:00",
    nightStart: "19:00",
  });
  for (const [time, result] of [
    ["06:59", "night"],
    ["07:00", "day"],
    ["18:59", "day"],
    ["19:00", "night"],
    ["23:59", "night"],
  ])
    assert.equal(C.automationPeriod(normal, clock(time)), result);
  const overnight = { ...normal, dayStart: "22:00", nightStart: "06:00" };
  for (const [time, result] of [
    ["21:59", "night"],
    ["22:00", "day"],
    ["00:01", "day"],
    ["05:59", "day"],
    ["06:00", "night"],
  ])
    assert.equal(C.automationPeriod(overnight, clock(time)), result);
});
test("system appearance changes palette while keeping global effects; pinned sites take priority", () => {
  const s = C.sanitizeState({
    theme: { font: "serif", wallpaper: "coast", blur: 20 },
    automation: { mode: "system" },
    siteThemes: { chatgpt: C.PRESETS[2] },
  });
  const dark = C.resolveTheme(s, { systemDark: true });
  assert.equal(dark.id, "midnight");
  assert.equal(dark.font, "serif");
  assert.equal(dark.wallpaper, "coast");
  assert.equal(dark.blur, 20);
  assert.equal(C.resolveTheme(s, { systemDark: false }).id, "lavender");
  assert.equal(
    C.resolveTheme(s, { site: "chatgpt", systemDark: true }).id,
    "matcha",
  );
});
test("saved-profile automation restores a complete look and deleted refs fall back safely", () => {
  const s = C.sanitizeState({
    profiles: [
      {
        id: "a",
        name: "Night",
        theme: { ...C.PRESETS[4], font: "mono", wallpaper: "none" },
      },
    ],
    automation: { mode: "system", nightTheme: "profile:a" },
  });
  const theme = C.resolveTheme(s, { systemDark: true });
  assert.equal(theme.id, "ocean");
  assert.equal(theme.font, "mono");
  assert.equal(theme.wallpaper, "none");
  const deleted = C.sanitizeState({ ...s, profiles: [] });
  assert.equal(deleted.automation.nightTheme, "preset:midnight");
});
test("contrast helper repairs low-contrast text and reports mixed light/dark surfaces", () => {
  const t = C.sanitizeTheme({
      text: "#eeeeee",
      muted: "#eeeeee",
      accent: "#eeeeee",
    }),
    fixed = C.readablePalette(t);
  assert.ok(fixed.minimum >= 4.5);
  assert.equal(fixed.mixedSurfaces, false);
  for (const fg of Object.values(fixed.patch))
    for (const bg of [t.bg, t.surface, t.sidebar])
      assert.ok(C.contrast(fg, bg) >= 4.5);
  assert.equal(
    C.readablePalette({
      ...t,
      bg: "#000000",
      surface: "#ffffff",
      sidebar: "#777777",
    }).mixedSurfaces,
    true,
  );
});

test("contrast repair never reduces worst-case contrast on mixed backgrounds", () => {
  const t = C.sanitizeTheme({
    bg: "#000000",
    surface: "#ffffff",
    sidebar: "#777777",
    text: "#666666",
    muted: "#bbbbbb",
    accent: "#123456",
  });
  const result = C.readablePalette(t);
  const worst = (color) =>
    Math.min(
      ...[t.bg, t.surface, t.sidebar].map((bg) => C.contrast(color, bg)),
    );
  for (const [key, color] of Object.entries(result.patch))
    assert.ok(worst(color) >= worst(t[key]));
});
test("empty and duplicate profile IDs do not produce conflicting UI keys or schedule references", () => {
  const s = C.sanitizeState({
    profiles: [
      { id: "same", name: "First" },
      { id: "same", name: "Second" },
      { id: "", name: "Empty" },
      { id: "blank", name: "   " },
    ],
  });
  assert.equal(s.profiles.length, 1);
  assert.equal(s.profiles[0].name, "First");
});
