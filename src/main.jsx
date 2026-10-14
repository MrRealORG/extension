import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Palette,
  Image,
  Type,
  Globe2,
  Layers3,
  Settings2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Check,
  X,
  RotateCcw,
  Download,
  Upload,
  Monitor,
  Expand,
  ArrowUp,
  Paperclip,
  Mic,
  PanelLeft,
  MessageSquare,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Info,
  CircleHelp,
  Sun,
  Moon,
  Heart,
  MoreHorizontal,
  Copy,
  Trash2,
  Pencil,
  Menu,
  Undo2,
  ExternalLink,
  Eye,
  CheckCircle2,
} from "lucide-react";
import "./styles.css";
import AutomationPanel, { useAppearanceClock } from "./AutomationPanel.jsx";
const C = globalThis.DreamCore;
const { PRESETS, SITES, FONT_MAP, DEFAULT_STATE, DEFAULT_THEME } = C;
const ext = globalThis.browser?.runtime?.id
  ? globalThis.browser
  : globalThis.chrome?.runtime?.id
    ? globalThis.chrome
    : null;
const wallpaperUrl = (t) =>
  t.wallpaper === "custom"
    ? t.wallpaperData
    : t.wallpaper === "none"
      ? ""
      : `./wallpapers/${t.wallpaper}.${t.wallpaper === "dunes" ? "jpg" : "svg"}`;
const uid = () => globalThis.crypto.randomUUID();

function Icon({ name, ...props }) {
  const I = name;
  return <I size={18} strokeWidth={1.7} {...props} />;
}
function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <img src="./icons/icon.svg" alt="" />
      <span>
        dream<span className="brand-dot">.</span>
      </span>
      {!small && <span className="version">STUDIO</span>}
    </div>
  );
}
function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span />
    </button>
  );
}
function SiteMark({ site, size = 25 }) {
  return (
    <span
      className={`site-mark site-${site.id}`}
      style={{ color: site.color, fontSize: size }}
      aria-hidden="true"
    >
      {site.mark}
    </span>
  );
}
function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  suffix = "%",
  description,
}) {
  return (
    <label className="range-field">
      <span className="range-label">
        <span>{label}</span>
        <b>
          {value}
          {suffix}
        </b>
      </span>
      {description && <span className="field-description">{description}</span>}
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
function MiniChat({ theme }) {
  return (
    <div
      className="mini-chat"
      style={{
        "--mini-bg": theme.bg,
        "--mini-side": theme.sidebar,
        "--mini-surface": theme.surface,
        "--mini-accent": theme.accent,
        "--mini-line": C.rgba(theme.text, 0.16),
      }}
    >
      <div className="mini-sidebar">
        <span className="mini-brand">✳</span>
        <i />
        <i />
        <i />
        <i />
        <span className="mini-avatar" />
      </div>
      <div className="mini-main">
        <div className="mini-top">
          <span />
          <MoreHorizontal size={10} />
        </div>
        <div className="mini-conversation">
          <div className="mini-user">
            <i />
            <i />
          </div>
          <div className="mini-answer">
            <span>✳</span>
            <div>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="mini-input">
          <span />
          <b>↑</b>
        </div>
      </div>
    </div>
  );
}
function ThemeCard({ theme, selected, onClick }) {
  return (
    <button
      className={`theme-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="theme-thumbnail">
        <MiniChat theme={theme} />
        {theme.tag && (
          <span className={`theme-tag ${theme.dark ? "dark" : ""}`}>
            {theme.tag}
          </span>
        )}
        {selected && (
          <span className="selected-badge">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="theme-meta">
        <span className="theme-name">{theme.name}</span>
        <div className="theme-swatches">
          {[theme.bg, theme.sidebar, theme.accent, theme.text].map((c, i) => (
            <span key={i} style={{ background: c }} />
          ))}
        </div>
      </div>
      <span className="theme-description">{theme.description}</span>
    </button>
  );
}
function Modal({ title, description, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const before = document.activeElement;
    const el = ref.current;
    el.focus();
    const handle = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = el.querySelectorAll(
          'button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]',
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <button
          className="icon-button modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2>{title}</h2>
        {description && <p className="modal-description">{description}</p>}
        {children}
      </section>
    </div>
  );
}
function ColorField({ label, color, onChange }) {
  const [text, setText] = useState(color);
  useEffect(() => setText(color), [color]);
  return (
    <label className="color-field">
      <span>{label}</span>
      <div>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
        />
        <input
          className="hex-input"
          aria-label={`${label} hex`}
          value={text}
          maxLength={7}
          onChange={(e) => {
            setText(e.target.value);
            if (C.isHex(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => setText(color)}
          spellCheck={false}
        />
      </div>
    </label>
  );
}
function ChatPreview({ theme, site, setSite, large = false }) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState("");
  const image = wallpaperUrl(theme);
  const css = {
    "--p-bg": theme.bg,
    "--p-surface": C.rgba(theme.surface, theme.glass ? theme.opacity / 100 : 1),
    "--p-side": C.rgba(theme.sidebar, theme.glass ? theme.opacity / 100 : 1),
    "--p-text": theme.text,
    "--p-muted": theme.muted,
    "--p-accent": theme.accent,
    "--p-border": theme.border,
    "--p-blur": `${theme.glass ? theme.blur : 0}px`,
    "--p-content": image ? C.rgba(theme.bg, 0.42) : "transparent",
    fontFamily: FONT_MAP[theme.font],
    backgroundColor: theme.bg,
    backgroundImage: image
      ? `linear-gradient(${C.rgba("#000000", theme.dim / 100)},${C.rgba("#000000", theme.dim / 100)}),url("${image}")`
      : undefined,
  };
  return (
    <div className={`chat-preview ${large ? "large" : ""}`} style={css}>
      <div className="preview-browser">
        <span className="browser-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-address">
          <ShieldCheck size={10} />
          {site.host}
        </span>
        <MoreHorizontal size={15} />
      </div>
      <div className="preview-app">
        <div className="preview-rail">
          <SiteMark site={site} size={22} />
          <button
            title="New preview conversation"
            aria-label="New preview conversation"
            onClick={() => setSent("")}
          >
            <Pencil size={15} />
          </button>
          <button
            title="Preview conversation"
            aria-label="Preview conversation"
            onClick={() => setSent("What can Dream customize?")}
          >
            <MessageSquare size={15} />
          </button>
          <span className="rail-bottom">J</span>
        </div>
        <div className="preview-content">
          <header>
            <span>
              {site.name}
              <ChevronDown size={13} />
            </span>
            <span className="preview-profile">J</span>
          </header>
          <div className="preview-greeting">
            <span className="preview-spark">✳</span>
            <h3>
              {sent ? "Your space, reimagined." : "A little inspiration?"}
            </h3>
            <p>
              {sent
                ? "Colors, fonts, and a little magic. All yours."
                : "Big ideas begin with a little daydream."}
            </p>
          </div>
          <div className="preview-messages">
            <div className="user-message">
              {sent || "Help me make a little space for creativity."}
            </div>
            <div className="assistant-message">
              <span className="assistant-symbol">✳</span>
              <div>
                <p>
                  {sent
                    ? "This is a local appearance preview. Your message hasn’t been sent to an AI."
                    : "Of course. Let’s make room for something good."}
                </p>
                <p>
                  {sent
                    ? "Your theme will feel right at home on your favorite chats."
                    : "A fresh perspective, a softer palette, and a space that feels entirely like you."}
                </p>
                <div className="message-tools">
                  <Copy size={11} />
                  <Heart size={11} />
                  <RotateCcw size={11} />
                </div>
              </div>
            </div>
          </div>
          <form
            className="preview-composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                setSent(draft.trim());
                setDraft("");
              }
            }}
          >
            <input
              aria-label="Try the theme preview"
              placeholder="A place for your next big idea…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div>
              <span>
                <Plus size={15} />
                <span className="preview-tools">Tools</span>
              </span>
              <span>
                <Mic size={14} />
                <button aria-label="Send preview message" type="submit">
                  <ArrowUp size={13} />
                </button>
              </span>
            </div>
          </form>
          <span className="preview-disclaimer">
            Appearance preview. No messages are sent.
          </span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState(C.sanitizeState(DEFAULT_STATE));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [saved, setSaved] = useState(true);
  const [page, setPage] = useState("appearance");
  const [tab, setTab] = useState("themes");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [profileName, setProfileName] = useState("");
  const [customHost, setCustomHost] = useState("");
  const [previewSite, setPreviewSite] = useState(SITES[0]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [pendingSite, setPendingSite] = useState(null);
  const fileRef = useRef();
  const importRef = useRef();
  const firstSave = useRef(true);
  const latest = useRef(state);
  latest.current = state;
  const clock = useAppearanceClock();
  const theme = C.resolveTheme(state, clock);
  const ratio = C.contrast(theme.text, theme.bg);
  const connected = Object.values(state.sites).filter(Boolean).length;
  const notify = (message) => setToast(message);
  useEffect(() => {
    (async () => {
      try {
        const stored = ext
          ? (await ext.storage.local.get("dream")).dream
          : JSON.parse(localStorage.getItem("dream") || "null");
        if (stored) setState(C.sanitizeState(stored));
      } catch {
        setStorageError(
          "Your settings could not be loaded. Export a backup before closing.",
        );
      }
      setReady(true);
    })();
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    setSaved(false);
    const timer = setTimeout(async () => {
      try {
        if (ext) {
          await ext.storage.local.set({ dream: state });
          const response = await ext.runtime.sendMessage({
            type: "DREAM_SYNC",
          });
          if (response && !response.ok) throw new Error(response.error);
        } else localStorage.setItem("dream", JSON.stringify(state));
        setSaved(true);
        setStorageError("");
      } catch (e) {
        setStorageError(
          "Could not save. Your browser storage may be full. Export a backup or use a smaller wallpaper.",
        );
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  function patchTheme(patch, record = true) {
    if (record)
      setHistory((h) => [
        ...h.slice(-19),
        C.resolveTheme(latest.current, clock),
      ]);
    setState((s) => ({
      ...s,
      theme: C.sanitizeTheme({ ...C.resolveTheme(s, clock), ...patch }),
      automation: { ...s.automation, mode: "manual" },
    }));
  }
  function chooseTheme(preset) {
    patchTheme({ ...preset });
    notify(`${preset.name} is your new mood`);
  }
  function navigate(next) {
    setPage(next);
    setSearch("");
    setMobileMenu(false);
    if (next === "wallpapers") setTab("wallpaper");
    if (next === "typography") setTab("typography");
    if (next === "appearance") setTab("themes");
  }
  function undo() {
    if (!history.length) return;
    setState((s) => ({
      ...s,
      theme: history[history.length - 1],
      automation: { ...s.automation, mode: "manual" },
    }));
    setHistory((h) => h.slice(0, -1));
    notify("Last appearance change undone");
  }
  async function enableSite(site, value) {
    if (!ext) {
      setModal("install");
      return;
    }
    if (!value) {
      setState((s) => ({ ...s, sites: { ...s.sites, [site.id]: false } }));
      return;
    }
    setPendingSite(site.id);
    try {
      const granted = await ext.permissions.request({
        origins: C.originsFor(site.id),
      });
      if (!granted) {
        notify("Site access was not granted. Nothing changed.");
        return;
      }
      setState((s) => ({ ...s, sites: { ...s.sites, [site.id]: true } }));
      notify(`Dream is enabled on ${site.name}`);
    } catch (e) {
      notify(
        `Could not enable ${site.name}. Try again from the installed extension.`,
      );
    } finally {
      setPendingSite(null);
    }
  }
  function saveProfile(e) {
    e.preventDefault();
    const name = profileName.trim();
    if (!name) return;
    if (state.profiles.length >= 50) {
      notify("You have 50 profiles. Export or remove one to make room.");
      return;
    }
    setState((s) => ({
      ...s,
      profiles: [...s.profiles, { id: uid(), name, theme: { ...theme } }],
    }));
    setProfileName("");
    setModal(null);
    notify(`“${name}” saved to your profiles`);
  }
  function duplicateProfile(profile) {
    if (state.profiles.length >= 50) {
      notify("You have 50 profiles. Remove one to make room.");
      return;
    }
    setState((s) => ({
      ...s,
      profiles: [
        ...s.profiles,
        { ...profile, id: uid(), name: `${profile.name.slice(0, 53)} (copy)` },
      ],
    }));
    notify("Profile duplicated. Give it a new name whenever you like.");
  }
  async function forgetSite(site, removeEntry = false) {
    setPendingSite(site.id);
    try {
      let stillGranted = false;
      if (ext) {
        const origins = C.originsFor(site.id);
        await ext.permissions.remove({ origins });
        const remaining = await Promise.all(
          origins.map((origin) =>
            ext.permissions.contains({ origins: [origin] }),
          ),
        );
        stillGranted = remaining.some(Boolean);
      }
      setState((old) => {
        const sites = { ...old.sites, [site.id]: false },
          siteThemes = { ...old.siteThemes };
        if (removeEntry) {
          delete sites[site.id];
          delete siteThemes[site.id];
        }
        return {
          ...old,
          sites,
          siteThemes,
          customSites: removeEntry
            ? old.customSites.filter((h) => h !== site.id)
            : old.customSites,
        };
      });
      setModal(null);
      notify(
        stillGranted
          ? "Dream is off here, but broader browser access remains. Revoke it in your browser’s extension settings."
          : removeEntry
            ? "Website removed. Its Dream access has been forgotten."
            : "Website access revoked. Dream is off for this site.",
      );
    } catch {
      notify(
        "Could not revoke access. Check this extension’s permissions in your browser.",
      );
    } finally {
      setPendingSite(null);
    }
  }
  function exportSettings() {
    const blob = new Blob(
      [
        JSON.stringify(
          { format: "dream-theme", version: 1, ...state },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dream-backup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify("Your Dream backup was exported");
  }
  async function importSettings(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      notify("Please use a backup smaller than 8 MB.");
      return;
    }
    try {
      const raw = JSON.parse(await file.text());
      if (raw.format !== "dream-theme" || raw.version !== 1 || !raw.theme)
        throw new Error();
      const clean = C.sanitizeState(raw);
      setState((s) => ({
        ...clean,
        sites: s.sites,
        customSites: s.customSites,
        enabled: s.enabled,
      }));
      notify("Backup imported. Website permissions were left unchanged.");
    } catch {
      notify(
        "That isn’t a valid Dream v1 backup. Please choose a Dream JSON export.",
      );
    }
  }
  async function uploadWallpaper(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      notify("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      notify("Please choose an image smaller than 15 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const factor = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * factor);
      canvas.height = Math.round(bitmap.height * factor);
      canvas
        .getContext("2d")
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const data = canvas.toDataURL("image/jpeg", 0.82);
      if (data.length > 4200000) throw new Error();
      patchTheme({ wallpaper: "custom", wallpaperData: data, glass: true });
      notify("Your wallpaper is ready. Stored only in this browser.");
    } catch {
      notify("This image could not be opened. Try a smaller JPG or PNG.");
    }
  }
  function addCustom(e) {
    e.preventDefault();
    const host = C.sanitizeHost(customHost);
    if (!host) {
      notify("Enter a valid HTTPS website, like example.com.");
      return;
    }
    if (
      state.customSites.includes(host) ||
      SITES.some((s) => s.domains.includes(host))
    ) {
      notify("That website is already in your list.");
      return;
    }
    if (state.customSites.length >= 100) {
      notify("Custom website limit reached (100).");
      return;
    }
    setState((s) => ({ ...s, customSites: [...s.customSites, host] }));
    setCustomHost("");
    notify("Website added. Enable it to grant site access.");
  }
  const navigation = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "wallpapers", label: "Wallpapers", icon: Image },
    { id: "typography", label: "Typography", icon: Type },
  ];
  const currentLabel = {
    appearance: "Appearance",
    wallpapers: "Wallpapers",
    typography: "Typography",
    websites: "Your websites",
    profiles: "My profiles",
    settings: "Settings",
  }[page];
  const openSave = () => {
    setProfileName(theme.name === "Custom" ? "My dream" : theme.name);
    setModal("save");
  };
  const themeViews = ["appearance", "wallpapers", "typography"].includes(page);
  const allSites = [
    ...SITES,
    ...state.customSites.map((host) => ({
      id: host,
      name: host,
      host,
      url: `https://${host}`,
      mark: "◎",
      color: "#8b78b8",
      custom: true,
    })),
  ];
  if (!ready)
    return (
      <div className="loading">
        <Brand />
        <span>Making a little space for you…</span>
      </div>
    );
  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <a
          className="brand-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("appearance");
          }}
        >
          <Brand />
        </a>
        <div className="workspace-selector">
          <span className="workspace-avatar">
            J<span>✧</span>
          </span>
          <div>
            <b>My dream space</b>
            <span>A little more you.</span>
          </div>
          <Sparkles size={16} />
        </div>
        <span className="nav-label">YOUR STUDIO</span>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
              {page === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <span className="nav-label library-label">MAKE IT YOURS</span>
        <nav>
          <button
            className={`nav-item ${page === "websites" ? "active" : ""}`}
            onClick={() => navigate("websites")}
          >
            <Globe2 size={18} />
            Your websites<span className="nav-count">{allSites.length}</span>
          </button>
          <button
            className={`nav-item ${page === "profiles" ? "active" : ""}`}
            onClick={() => navigate("profiles")}
          >
            <Layers3 size={18} />
            My profiles
            {state.profiles.length > 0 && (
              <span className="nav-count">{state.profiles.length}</span>
            )}
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="dream-note">
            <span className="note-spark">✧</span>
            <b>
              Your internet.
              <br />
              Your kind of beautiful.
            </b>
            <p>
              Small changes.
              <br />A whole different feeling.
            </p>
            <div className="note-colors">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <button
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Settings2 size={18} />
            Settings
          </button>
          <button className="nav-item" onClick={() => setModal("help")}>
            <CircleHelp size={18} />A little help
            <ArrowUpRight size={15} className="push-right" />
          </button>
          <div className="local-status">
            <span />
            <span>
              {ext
                ? "Everything stays on your device"
                : "Browser preview · local only"}
            </span>
            <ShieldCheck size={13} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Your studio</span>
            <ChevronRight size={13} />
            <b>{currentLabel}</b>
          </div>
          <div className="topbar-right">
            <span className="save-status">
              <span className={storageError ? "error-dot" : ""} />
              {storageError
                ? "Not saved"
                : saved
                  ? "All changes saved"
                  : "Saving…"}
            </span>
            <span className="topbar-divider" />
            <button
              className="dream-status"
              onClick={() =>
                ext
                  ? setState((s) => ({ ...s, enabled: !s.enabled }))
                  : setModal("install")
              }
            >
              <span className={state.enabled ? "status-on" : ""} />
              {ext
                ? state.enabled
                  ? "Dream is on"
                  : "Dream is paused"
                : "Get the extension"}
              {!ext && <ArrowUpRight size={14} />}
            </button>
            <button
              className="user-avatar"
              aria-label="Open my profiles"
              onClick={() => navigate("profiles")}
            >
              J
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <div className="error-banner">
              <Info size={16} />
              {storageError}
              <button onClick={exportSettings}>Export backup</button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">A SPACE THAT FEELS LIKE YOU</div>
              <h1>
                {page === "appearance"
                  ? "Make yourself at home."
                  : page === "wallpapers"
                    ? "Set a different scene."
                    : page === "typography"
                      ? "Find your type."
                      : page === "websites"
                        ? "Same chats. New feeling."
                        : page === "profiles"
                          ? "A mood for every moment."
                          : "The little details."}
              </h1>
              <p>
                {themeViews
                  ? "Your favorite AI chats, in your favorite colors. A little magic, all yours."
                  : page === "websites"
                    ? "Bring your Dream to the places you think, create, and explore."
                    : page === "profiles"
                      ? "Keep your favorite combinations close. Switch things up whenever you like."
                      : "Simple controls. Thoughtful defaults. Always in your hands."}
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="button subtle reset-button"
                onClick={() => setModal("reset")}
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button className="button primary" onClick={openSave}>
                <Plus size={16} />
                Save profile
              </button>
            </div>
          </div>
          {themeViews && state.automation.mode !== "manual" && (
            <div className="automation-banner">
              <Moon size={16} />
              <span>
                <b>
                  {state.automation.mode === "system"
                    ? "Following your device"
                    : "Your daily rhythm is on"}
                </b>{" "}
                · {theme.name}. Editing this look pauses automatic switching.
              </span>
              <button onClick={() => navigate("settings")}>
                Manage <ArrowUpRight size={14} />
              </button>
            </div>
          )}
          {themeViews ? (
            <>
              <div className="welcome-banner">
                <div className="welcome-icon">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="welcome-title">
                    Not a new layout. A new feeling.
                    <span className="pill">100% YOU</span>
                  </div>
                  <p>
                    Keep everything where it belongs. Make the colors, fonts,
                    and atmosphere yours.
                  </p>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="orb orb-one" />
                  <div className="orb orb-two" />
                  <span className="art-star one">✧</span>
                  <span className="art-star two">✦</span>
                  <span className="art-dot" />
                </div>
              </div>
              <div className="studio-grid">
                <section className="editor-panel">
                  <div
                    className="editor-tabs"
                    role="tablist"
                    aria-label="Appearance controls"
                  >
                    {[
                      { id: "themes", label: "Themes", icon: Palette },
                      {
                        id: "colors",
                        label: "Colors",
                        icon: SlidersHorizontal,
                      },
                      { id: "wallpaper", label: "Wallpaper", icon: Image },
                      { id: "typography", label: "Typography", icon: Type },
                    ].map((t) => (
                      <button
                        role="tab"
                        aria-selected={tab === t.id}
                        key={t.id}
                        onClick={() => {
                          setTab(t.id);
                          setPage(
                            t.id === "wallpaper"
                              ? "wallpapers"
                              : t.id === "typography"
                                ? "typography"
                                : "appearance",
                          );
                        }}
                        className={tab === t.id ? "active" : ""}
                      >
                        <Icon name={t.icon} size={15} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div
                    className="editor-content"
                    role="tabpanel"
                    aria-label={`${tab} controls`}
                  >
                    {tab === "themes" && (
                      <>
                        <div className="section-title">
                          <div>
                            <h2>Find your mood</h2>
                            <p>A starting point for something personal.</p>
                          </div>
                          <span className="tiny-counter">
                            {PRESETS.length} curated themes
                          </span>
                        </div>
                        <div className="theme-filter">
                          <div className="filter-pills">
                            {["all", "light", "dark"].map((f) => (
                              <button
                                key={f}
                                className={filter === f ? "active" : ""}
                                onClick={() => setFilter(f)}
                              >
                                {f === "light" && <Sun size={12} />}{" "}
                                {f === "dark" && <Moon size={12} />}{" "}
                                {f === "all"
                                  ? "All themes"
                                  : f === "light"
                                    ? "Light"
                                    : "Dark"}
                              </button>
                            ))}
                          </div>
                          <span className="color-count">
                            <span />
                            Made to feel good
                          </span>
                        </div>
                        <div className="theme-grid">
                          {PRESETS.filter(
                            (t) =>
                              filter === "all" ||
                              (filter === "dark" ? t.dark : !t.dark),
                          ).map((t) => (
                            <ThemeCard
                              key={t.id}
                              theme={t}
                              selected={theme.id === t.id}
                              onClick={() => chooseTheme(t)}
                            />
                          ))}
                        </div>
                        <div className="custom-callout">
                          <span className="custom-icon">
                            <SlidersHorizontal size={18} />
                          </span>
                          <div>
                            <b>A little more particular? We get it.</b>
                            <p>
                              Fine-tune every color and make it truly yours.
                            </p>
                          </div>
                          <button
                            aria-label="Customize colors"
                            onClick={() => setTab("colors")}
                          >
                            <ArrowUpRight size={19} />
                          </button>
                        </div>
                      </>
                    )}
                    {tab === "colors" && (
                      <>
                        <div className="section-title">
                          <div>
                            <h2>Your palette, your rules</h2>
                            <p>Every shade is a chance to make it yours.</p>
                          </div>
                          <span className="soft-badge">7 colors</span>
                        </div>
                        <div className="palette-strip">
                          {[
                            "bg",
                            "sidebar",
                            "surface",
                            "accent",
                            "text",
                            "muted",
                            "border",
                          ].map((k) => (
                            <span key={k} style={{ background: theme[k] }} />
                          ))}
                        </div>
                        <div className="color-grid">
                          {[
                            ["bg", "Background"],
                            ["surface", "Cards & inputs"],
                            ["sidebar", "Sidebar"],
                            ["accent", "Accent & links"],
                            ["text", "Main text"],
                            ["muted", "Secondary text"],
                            ["border", "Borders"],
                          ].map(([key, label]) => (
                            <ColorField
                              key={key}
                              label={label}
                              color={theme[key]}
                              onChange={(value) =>
                                patchTheme({
                                  [key]: value,
                                  id: "custom",
                                  name: "Custom",
                                })
                              }
                            />
                          ))}
                        </div>
                        <div
                          className={`contrast-note ${ratio < 4.5 ? "warning" : ""}`}
                        >
                          <ShieldCheck size={18} />
                          <div>
                            <b>
                              {ratio >= 4.5
                                ? "Easy on the eyes"
                                : "A little more contrast?"}
                            </b>
                            <p>
                              Text contrast: {ratio.toFixed(2)}:1 ·{" "}
                              {ratio >= 4.5
                                ? "WCAG AA on the background"
                                : "Aim for 4.5:1 for readable text"}
                            </p>
                          </div>
                        </div>
                        <button
                          className="button secondary contrast-repair"
                          onClick={() => {
                            const result = C.readablePalette(theme);
                            if (!Object.keys(result.patch).length) {
                              notify(
                                "Your solid-color text pairs already meet 4.5:1.",
                              );
                              return;
                            }
                            patchTheme({
                              ...result.patch,
                              id: "custom",
                              name: "Custom",
                            });
                            notify(
                              result.mixedSurfaces
                                ? "Text improved. Your light and dark surfaces still need individual adjustments."
                                : "Text, secondary text, and links now meet 4.5:1 on solid surfaces.",
                            );
                          }}
                        >
                          <ShieldCheck size={14} />
                          Improve text contrast
                        </button>
                        <p className="fine-print">
                          Glass and wallpapers can affect contrast. Check the
                          live preview before applying.
                        </p>
                        <button
                          className="button subtle"
                          onClick={() =>
                            patchTheme({
                              ...(PRESETS.find((p) => p.id === theme.id) ||
                                PRESETS[0]),
                            })
                          }
                        >
                          <RotateCcw size={14} />
                          Restore palette
                        </button>
                      </>
                    )}
                    {tab === "wallpaper" && (
                      <>
                        <div className="section-title">
                          <div>
                            <h2>A view of your own</h2>
                            <p>A little escape, right behind your ideas.</p>
                          </div>
                          <span className="soft-badge">Local & private</span>
                        </div>
                        <div className="wallpaper-grid">
                          {[
                            { id: "none", name: "Just the colors" },
                            { id: "dunes", name: "Lavender dunes" },
                            { id: "aurora", name: "Northern lights" },
                            { id: "coast", name: "Quiet coast" },
                          ].map((w) => (
                            <button
                              key={w.id}
                              className={`wallpaper-card ${theme.wallpaper === w.id ? "selected" : ""}`}
                              onClick={() =>
                                patchTheme({
                                  wallpaper: w.id,
                                  ...(w.id === "none" ? {} : { glass: true }),
                                })
                              }
                            >
                              <div
                                className={`wallpaper-thumb ${w.id === "none" ? "plain-wallpaper" : ""}`}
                                style={
                                  w.id !== "none"
                                    ? {
                                        backgroundImage: `url(./wallpapers/${w.id}.${w.id === "dunes" ? "jpg" : "svg"})`,
                                      }
                                    : { background: theme.bg }
                                }
                              >
                                {w.id === "none" && <Palette size={25} />}
                                <span className="wallpaper-check">
                                  <Check size={12} />
                                </span>
                              </div>
                              <span>{w.name}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          className={`upload-area ${theme.wallpaper === "custom" ? "has-wallpaper" : ""}`}
                          onClick={() => fileRef.current.click()}
                        >
                          <Upload size={22} />
                          <b>
                            {theme.wallpaper === "custom"
                              ? "Your wallpaper is looking good"
                              : "Bring your own little world"}
                          </b>
                          <span>
                            {theme.wallpaper === "custom"
                              ? "Click to replace your wallpaper"
                              : "Upload a JPG, PNG, or WebP · up to 15 MB"}
                          </span>
                        </button>
                        {theme.wallpaper === "custom" && (
                          <button
                            className="text-button"
                            onClick={() =>
                              patchTheme({
                                wallpaper: "none",
                                wallpaperData: "",
                              })
                            }
                          >
                            Remove uploaded wallpaper
                          </button>
                        )}
                        <Range
                          label="Wallpaper dimming"
                          value={theme.dim}
                          max={70}
                          onChange={(dim) => patchTheme({ dim }, false)}
                        />
                      </>
                    )}
                    {tab === "typography" && (
                      <>
                        <div className="section-title">
                          <div>
                            <h2>Words with personality</h2>
                            <p>A fresh voice for every conversation.</p>
                          </div>
                          <Type size={24} className="muted-icon" />
                        </div>
                        <div className="font-options">
                          {[
                            {
                              id: "system",
                              name: "The familiar one",
                              sub: "System sans · clean & effortless",
                              sample: "Good things start with an idea.",
                            },
                            {
                              id: "rounded",
                              name: "A softer side",
                              sub: "Humanist sans · warm & friendly",
                              sample: "Make room for a little wonder.",
                            },
                            {
                              id: "serif",
                              name: "A timeless touch",
                              sub: "Classic serif · thoughtful & editorial",
                              sample: "Stay curious. Think beautifully.",
                            },
                            {
                              id: "mono",
                              name: "Perfectly precise",
                              sub: "Monospace · focused & considered",
                              sample: "A little order. A lot of possibility.",
                            },
                          ].map((f) => (
                            <button
                              key={f.id}
                              className={`font-option ${theme.font === f.id ? "selected" : ""}`}
                              onClick={() => patchTheme({ font: f.id })}
                            >
                              <div>
                                <b>{f.name}</b>
                                <span>{f.sub}</span>
                              </div>
                              <span
                                className="font-sample"
                                style={{ fontFamily: FONT_MAP[f.id] }}
                              >
                                {f.sample}
                              </span>
                              <span className="radio-indicator">
                                {theme.font === f.id && <span />}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="setting-line code-setting">
                          <div>
                            <b>Keep code looking like code</b>
                            <p>Preserve code fonts and syntax highlighting.</p>
                          </div>
                          <Toggle
                            checked={theme.preserveCode}
                            onChange={(v) => patchTheme({ preserveCode: v })}
                            label="Preserve code formatting"
                          />
                        </div>
                        <div className="info-note">
                          <Info size={16} />
                          <span>
                            Fonts are already on your device. No downloads, no
                            tracking, and no changes to text size or spacing.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="glass-section">
                    <div className="section-title">
                      <div className="glass-title">
                        <span className="glass-icon">
                          <Layers3 size={19} />
                        </span>
                        <div>
                          <h2>
                            A touch of glass
                            <span className="pill">THE FINISHING TOUCH</span>
                          </h2>
                          <p>Let a little of the world shine through.</p>
                        </div>
                      </div>
                      <Toggle
                        checked={theme.glass}
                        onChange={(v) => patchTheme({ glass: v })}
                        label="Glass effect"
                      />
                    </div>
                    <div
                      className={`glass-controls ${!theme.glass ? "disabled-controls" : ""}`}
                    >
                      <Range
                        label="Surface opacity"
                        value={theme.opacity}
                        min={25}
                        onChange={(opacity) => patchTheme({ opacity }, false)}
                      />
                      <Range
                        label="Background blur"
                        value={theme.blur}
                        max={30}
                        suffix="px"
                        onChange={(blur) => patchTheme({ blur }, false)}
                      />
                    </div>
                  </div>
                </section>
                <aside className="preview-panel">
                  <div className="preview-heading">
                    <h2>
                      <span className="live-dot" />
                      Live preview
                    </h2>
                    <button
                      className="icon-button"
                      aria-label="Expand preview"
                      onClick={() => setModal("preview")}
                    >
                      <Expand size={16} />
                    </button>
                  </div>
                  <div className="preview-site-tabs">
                    {SITES.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        className={previewSite.id === s.id ? "active" : ""}
                        onClick={() => setPreviewSite(s)}
                      >
                        <SiteMark site={s} size={15} />
                        {s.name}
                      </button>
                    ))}
                    <div className="preview-site-more">
                      <select
                        aria-label="Preview website"
                        value={previewSite.id}
                        onChange={(e) =>
                          setPreviewSite(
                            SITES.find((s) => s.id === e.target.value),
                          )
                        }
                      >
                        {SITES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <ChatPreview
                    theme={theme}
                    site={previewSite}
                    setSite={setPreviewSite}
                  />
                  <div className="preview-caption">
                    <span
                      className="theme-dot"
                      style={{ background: theme.accent }}
                    />
                    <b>{theme.name}</b>
                    <span>·</span>
                    <span>
                      {theme.font === "system"
                        ? "System sans"
                        : theme.font === "serif"
                          ? "Classic serif"
                          : theme.font === "rounded"
                            ? "Humanist sans"
                            : "Monospace"}
                    </span>
                    <button
                      aria-label="Undo appearance change"
                      disabled={!history.length}
                      onClick={undo}
                    >
                      <Undo2 size={15} />
                    </button>
                  </div>
                  <div className="preview-apply">
                    <div>
                      <ShieldCheck size={16} />
                      <span>Same layout. A whole new atmosphere.</span>
                    </div>
                    <button
                      className="button primary apply-button"
                      onClick={() => navigate("websites")}
                    >
                      Apply to websites
                      <ArrowUpRight size={16} />
                    </button>
                    <p>
                      {ext
                        ? `${connected} website${connected === 1 ? "" : "s"} enabled · updates apply automatically`
                        : "Make it real. Install Dream, then pick your websites."}
                    </p>
                  </div>
                  <div className="tip-card">
                    <span>✧</span>
                    <div>
                      <b>Make a mood, save a moment.</b>
                      <p>
                        Save your setup as a profile. Your next favorite feeling
                        is only a click away.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
              <section className="works-with">
                <div>
                  <span className="tiny-label">GOOD COMPANY</span>
                  <h3>At home in your favorite chats.</h3>
                </div>
                <div className="partner-sites">
                  {SITES.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setPreviewSite(s);
                        notify(
                          `Previewing ${s.name}. Enable it in Your websites.`,
                        );
                      }}
                      title={`Preview ${s.name}`}
                    >
                      <SiteMark site={s} size={23} />
                      <span>{s.name}</span>
                    </button>
                  ))}
                  <button
                    className="more-sites"
                    onClick={() => navigate("websites")}
                  >
                    +{SITES.length - 6} more
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </section>
            </>
          ) : page === "websites" ? (
            <section className="full-panel">
              <div className="section-title websites-title">
                <div>
                  <h2>A little Dream, everywhere</h2>
                  <p>
                    {ext
                      ? "Enable each website to grant access. Your theme applies to open tabs automatically."
                      : "Explore supported sites. Install Dream to enable real website customization."}
                  </p>
                </div>
                <span className="soft-badge">{connected} enabled</span>
              </div>
              <div className="website-toolbar">
                <label className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search websites"
                    placeholder="Find your favorite AI chat…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                {!ext && (
                  <button
                    className="button primary"
                    onClick={() => setModal("install")}
                  >
                    <Download size={15} />
                    Install Dream
                  </button>
                )}
              </div>
              <div className="site-list">
                {allSites
                  .filter((s) =>
                    `${s.name} ${s.host}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((s) => (
                    <div className="site-row" key={s.id}>
                      <div className="site-logo-box">
                        <SiteMark site={s} />
                      </div>
                      <div className="site-info">
                        <b>
                          {s.name}
                          {s.custom && (
                            <span className="soft-badge">Experimental</span>
                          )}
                        </b>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.host}
                          <ArrowUpRight size={11} />
                        </a>
                      </div>
                      <select
                        aria-label={`Theme for ${s.name}`}
                        value={state.siteThemes[s.id] ? "custom" : "global"}
                        onChange={(e) => {
                          if (e.target.value === "global") {
                            setState((old) => {
                              const st = { ...old.siteThemes };
                              delete st[s.id];
                              return { ...old, siteThemes: st };
                            });
                          } else {
                            setState((old) => ({
                              ...old,
                              siteThemes: {
                                ...old.siteThemes,
                                [s.id]: { ...C.resolveTheme(old, clock) },
                              },
                            }));
                            notify(`Current appearance pinned to ${s.name}`);
                          }
                        }}
                      >
                        <option value="global">Follow my theme</option>
                        <option value="custom">Pin current appearance</option>
                      </select>
                      <Toggle
                        checked={state.sites[s.id] || false}
                        disabled={pendingSite === s.id}
                        label={`Enable Dream on ${s.name}`}
                        onChange={(v) => enableSite(s, v)}
                      />
                      <button
                        className="icon-button site-access-button"
                        aria-label={
                          s.custom
                            ? `Remove ${s.name}`
                            : `Revoke access to ${s.name}`
                        }
                        disabled={pendingSite === s.id}
                        onClick={() => {
                          if (!ext && !s.custom) {
                            setModal("install");
                            return;
                          }
                          setModal({ type: "forget-site", site: s });
                        }}
                      >
                        {s.custom ? (
                          <Trash2 size={15} />
                        ) : (
                          <ShieldCheck size={15} />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
              {!allSites.some((s) =>
                `${s.name} ${s.host}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && (
                <div className="empty-search">
                  No websites match “{search}”. Try another name.
                </div>
              )}
              <div className="add-website">
                <div>
                  <h3>Somewhere else in mind?</h3>
                  <p>
                    Add an HTTPS website. Custom sites use the experimental
                    color engine.
                  </p>
                </div>
                <form onSubmit={addCustom}>
                  <input
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    placeholder="example.com"
                    aria-label="Custom website"
                    required
                  />
                  <button className="button secondary" type="submit">
                    <Plus size={15} />
                    Add website
                  </button>
                </form>
              </div>
              <div className="info-note">
                <ShieldCheck size={17} />
                <span>
                  Dream only runs on websites you enable. It doesn’t read, save,
                  or send your conversations. Third-party websites can change;
                  if something looks off, switch Dream off for that site.
                </span>
              </div>
            </section>
          ) : page === "profiles" ? (
            <section className="full-panel">
              <div className="section-title">
                <div>
                  <h2>Your collection</h2>
                  <p>
                    Colors, fonts, wallpapers, and glass. A whole feeling,
                    saved.
                  </p>
                </div>
                <span className="soft-badge">
                  {state.profiles.length} / 50 profiles
                </span>
              </div>
              {state.profiles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Layers3 size={32} />
                    <Sparkles size={17} />
                  </div>
                  <h2>Your first mood is waiting.</h2>
                  <p>
                    Love how things look? Save your current appearance
                    <br />
                    and come back to it whenever you like.
                  </p>
                  <button className="button primary" onClick={openSave}>
                    <Plus size={16} />
                    Save your first profile
                  </button>
                </div>
              ) : (
                <div className="profile-grid">
                  {state.profiles.map((p) => (
                    <article className="profile-card" key={p.id}>
                      <MiniChat theme={p.theme} />
                      <div>
                        <h3>{p.name}</h3>
                        <span>
                          {p.theme.name} · {p.theme.font}
                        </span>
                      </div>
                      <footer>
                        <button
                          className="button secondary"
                          onClick={() => {
                            patchTheme(p.theme);
                            notify(`“${p.name}” applied`);
                          }}
                        >
                          Use profile
                          <ArrowUpRight size={14} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Rename ${p.name}`}
                          onClick={() => {
                            setProfileName(p.name);
                            setModal({ type: "rename", profile: p });
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Duplicate ${p.name}`}
                          onClick={() => duplicateProfile(p)}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Delete ${p.name}`}
                          onClick={() =>
                            setModal({ type: "delete", profile: p })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
              <div className="profile-backup">
                <div>
                  <Download size={20} />
                  <span>
                    <b>Keep your collection close.</b>
                    <p>
                      Export a backup to take your Dream to another browser.
                    </p>
                  </span>
                </div>
                <button className="button secondary" onClick={exportSettings}>
                  Export backup
                </button>
                <button
                  className="button subtle"
                  onClick={() => importRef.current.click()}
                >
                  Import backup
                </button>
              </div>
            </section>
          ) : (
            <section className="full-panel settings-panel">
              <div className="section-title">
                <div>
                  <h2>Made to stay out of your way</h2>
                  <p>Just the essentials. No accounts or subscriptions.</p>
                </div>
                <ShieldCheck size={24} className="muted-icon" />
              </div>
              <AutomationPanel
                state={state}
                clock={clock}
                onChange={(automation) =>
                  setState((s) => ({ ...s, automation }))
                }
              />
              <div className="setting-line">
                <div>
                  <b>Enable Dream</b>
                  <p>
                    Pause all website customization without losing your
                    settings.
                  </p>
                </div>
                <Toggle
                  checked={state.enabled}
                  label="Enable Dream globally"
                  onChange={(enabled) => setState((s) => ({ ...s, enabled }))}
                />
              </div>
              <div className="setting-line">
                <div>
                  <b>Preserve code formatting</b>
                  <p>Leave code blocks and syntax colors untouched.</p>
                </div>
                <Toggle
                  checked={theme.preserveCode}
                  label="Preserve code formatting"
                  onChange={(preserveCode) => patchTheme({ preserveCode })}
                />
              </div>
              <div className="setting-line">
                <div>
                  <b>Your data stays yours</b>
                  <p>
                    Stored locally in this browser. No analytics, no cloud, no
                    tracking.
                  </p>
                </div>
                <span className="privacy-chip">
                  <Check size={13} />
                  Always private
                </span>
              </div>
              <div className="setting-line">
                <div>
                  <b>Backup & restore</b>
                  <p>
                    Export your profiles and settings. Uploaded wallpaper is
                    included.
                  </p>
                </div>
                <div className="inline-actions">
                  <button className="button secondary" onClick={exportSettings}>
                    <Download size={14} />
                    Export
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => importRef.current.click()}
                  >
                    <Upload size={14} />
                    Import
                  </button>
                </div>
              </div>
              <div className="setting-line">
                <div>
                  <b>Install in your browser</b>
                  <p>Chrome, Brave, Edge, and a separate Firefox build.</p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setModal("install")}
                >
                  Installation guide
                  <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="setting-line">
                <div>
                  <b>A fresh start</b>
                  <p>
                    Reset your appearance. Saved profiles and site access are
                    kept.
                  </p>
                </div>
                <button
                  className="button subtle"
                  onClick={() => setModal("reset")}
                >
                  <RotateCcw size={14} />
                  Reset appearance
                </button>
              </div>
              <div className="settings-footer">
                <Brand small />
                <span>
                  Version {C.VERSION} · Made for your kind of internet.
                </span>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>
              <Heart size={12} />A little less ordinary. A little more you.
            </span>
            <span>
              Private by design<span className="footer-dot">·</span>Made to make
              you feel good
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="m7 1 1.5 4.5L13 7l-4.5 1.5L7 13 5.5 8.5 1 7l4.5-1.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </footer>
        </main>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={uploadWallpaper}
        hidden
      />
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        onChange={importSettings}
        hidden
      />
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal === "save" && (
        <Modal
          title="Save a little feeling."
          description="Give your current appearance a name. It’ll be right here when you need it."
          onClose={() => setModal(null)}
        >
          <div className="save-profile-preview">
            <MiniChat theme={theme} />
          </div>
          <form onSubmit={saveProfile}>
            <label className="form-label">
              Profile name
              <input
                autoFocus
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={60}
                placeholder="My lavender afternoons"
                required
              />
            </label>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setModal(null)}
              >
                Not now
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={!profileName.trim()}
              >
                <Plus size={15} />
                Save profile
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal
          title="A clean little slate?"
          description="This restores Lavender haze and the default font, wallpaper, and glass settings, and pauses automatic switching. Your profiles and enabled websites won’t change."
          onClose={() => setModal(null)}
        >
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal(null)}>
              Keep my look
            </button>
            <button
              className="button primary"
              onClick={() => {
                patchTheme(DEFAULT_THEME);
                setModal(null);
                notify("Back to the beginning. Your profiles are safe.");
              }}
            >
              Reset appearance
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "delete" && (
        <Modal
          title={`Delete “${modal.profile.name}”?`}
          description="Your current appearance won’t change. This saved profile will be removed."
          onClose={() => setModal(null)}
        >
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal(null)}>
              Keep profile
            </button>
            <button
              className="button danger"
              onClick={() => {
                setState((s) =>
                  C.sanitizeState({
                    ...s,
                    profiles: s.profiles.filter(
                      (p) => p.id !== modal.profile.id,
                    ),
                  }),
                );
                setModal(null);
                notify("Profile deleted");
              }}
            >
              Delete profile
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "rename" && (
        <Modal
          title="A name that feels right."
          description="Rename this profile without changing its appearance or schedule."
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = profileName.trim();
              if (!name) return;
              setState((s) => ({
                ...s,
                profiles: s.profiles.map((p) =>
                  p.id === modal.profile.id ? { ...p, name } : p,
                ),
              }));
              setModal(null);
              notify("Profile renamed");
            }}
          >
            <label className="form-label rename-label">
              Profile name
              <input
                autoFocus
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={60}
                required
              />
            </label>
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={!profileName.trim()}
              >
                Rename profile
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal?.type === "forget-site" && (
        <Modal
          title={
            modal.site.custom
              ? `Remove ${modal.site.name}?`
              : `Revoke ${modal.site.name} access?`
          }
          description="Dream will stop running on this website and revoke its requested browser access. You can enable it again later. Unlike pausing a site, this forgets the permission too."
          onClose={() => {
            if (!pendingSite) setModal(null);
          }}
        >
          <div className="modal-actions">
            <button
              className="button secondary"
              disabled={!!pendingSite}
              onClick={() => setModal(null)}
            >
              Keep website
            </button>
            <button
              className="button danger"
              disabled={!!pendingSite}
              onClick={() => forgetSite(modal.site, !!modal.site.custom)}
            >
              {pendingSite
                ? "Removing access…"
                : modal.site.custom
                  ? "Remove website"
                  : "Revoke access"}
            </button>
          </div>
        </Modal>
      )}
      {modal === "preview" && (
        <Modal
          title="See the bigger picture."
          description={`${previewSite.name} · An illustrative theme preview, not the real website.`}
          onClose={() => setModal(null)}
          wide
        >
          <ChatPreview theme={theme} site={previewSite} large />
        </Modal>
      )}
      {modal === "install" && (
        <Modal
          title="Take Dream with you."
          description="The studio is your playground. The extension brings your look to real websites."
          onClose={() => setModal(null)}
        >
          <div className="install-browser">
            <Monitor size={22} />
            <div>
              <h3>Chrome, Brave & Edge</h3>
              <p>Use the Chromium package.</p>
            </div>
            <span className="soft-badge">Manifest V3</span>
          </div>
          <ol className="install-steps">
            <li>Download and unzip the extension package.</li>
            <li>
              Open <code>chrome://extensions</code> (or{" "}
              <code>brave://extensions</code> / <code>edge://extensions</code>).
            </li>
            <li>
              Turn on <b>Developer mode</b>, choose <b>Load unpacked</b>, and
              select the extracted folder containing <code>manifest.json</code>.
            </li>
            <li>
              Click Dream in your toolbar. Go to <b>Your websites</b> and enable
              a site. Approve access when prompted.
            </li>
          </ol>
          {!ext && (
            <a
              className="button primary download-button"
              href="/downloads/dream-chromium.zip"
              download
            >
              <Download size={16} />
              Download Chromium extension
            </a>
          )}
          <details className="firefox-details">
            <summary>
              Using Firefox?
              <ChevronDown size={14} />
            </summary>
            <p>
              Download and unzip the Firefox package. Open{" "}
              <code>about:debugging#/runtime/this-firefox</code>, choose{" "}
              <b>Load Temporary Add-on</b>, and select its manifest. Temporary
              installs are removed when Firefox restarts. Permanent installation
              requires Mozilla signing.
            </p>
            {!ext && (
              <a
                className="button secondary"
                href="/downloads/dream-firefox.zip"
                download
              >
                <Download size={14} />
                Download Firefox extension
              </a>
            )}
          </details>
          <div className="info-note">
            <Info size={16} />
            <span>
              Safari needs a separate Xcode conversion and signing process.
              Mobile browsers and browser-internal pages are not supported.
              Web-preview settings don’t automatically transfer—use Export and
              Import.
            </span>
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="A little guide to Dream."
          description="A calmer, more personal corner of the internet."
          onClose={() => setModal(null)}
        >
          <div className="help-item">
            <span>01</span>
            <div>
              <h3>Start with a feeling</h3>
              <p>
                Pick a theme, tweak every color, and choose a font that feels
                like you.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>02</span>
            <div>
              <h3>Add a little atmosphere</h3>
              <p>
                Choose a wallpaper or upload your own. Add glass, then adjust
                blur and opacity.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>03</span>
            <div>
              <h3>Make it real</h3>
              <p>
                Install Dream and enable your favorite sites. Changes apply
                automatically. A site can follow your global theme or keep a
                pinned appearance.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>04</span>
            <div>
              <h3>Keep your favorites</h3>
              <p>
                Save a profile for every mood. Export a backup before moving to
                another browser.
              </p>
            </div>
          </div>
          <div className="info-note">
            <Info size={16} />
            <span>
              Dream changes appearance, not functionality. Preview layouts are
              illustrative. Shadow DOM, embedded frames, and some site-specific
              graphics may keep their original colors.
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
