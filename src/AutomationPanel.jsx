import React from "react";
import { Clock3, Monitor, Sun, Moon, Hand, ArrowRight } from "lucide-react";
const C = globalThis.DreamCore;
export default function AutomationPanel({ state, onChange, clock }) {
  const automation = state.automation;
  const period = C.automationPeriod(automation, clock.date, clock.systemDark);
  const current = C.resolveTheme(state, clock);
  const update = (patch) =>
    onChange(C.sanitizeAutomation({ ...automation, ...patch }, state.profiles));
  const modes = [
    {
      id: "manual",
      icon: Hand,
      name: "Keep it personal",
      detail: "Switch your look yourself",
    },
    {
      id: "system",
      icon: Monitor,
      name: "Follow your device",
      detail: "Match light and dark mode",
    },
    {
      id: "schedule",
      icon: Clock3,
      name: "Set a rhythm",
      detail: "A different mood, day and night",
    },
  ];
  function options() {
    return (
      <>
        <optgroup label="Curated palettes">
          {C.PRESETS.map((p) => (
            <option key={p.id} value={`preset:${p.id}`}>
              {p.name}
            </option>
          ))}
        </optgroup>
        {state.profiles.length > 0 && (
          <optgroup label="Your saved profiles">
            {state.profiles.map((p) => (
              <option key={p.id} value={`profile:${p.id}`}>
                {p.name}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  }
  return (
    <section className="automation-panel" aria-labelledby="automation-title">
      <div className="section-title">
        <div>
          <h2 id="automation-title">A rhythm of your own</h2>
          <p>
            Let your space change with your day. No extra permissions needed.
          </p>
        </div>
        <Clock3 size={22} className="muted-icon" />
      </div>
      <div
        className="automation-modes"
        role="group"
        aria-label="Theme switching mode"
      >
        {modes.map(({ id, icon: Icon, name, detail }) => (
          <button
            key={id}
            className={automation.mode === id ? "selected" : ""}
            aria-pressed={automation.mode === id}
            onClick={() => update({ mode: id })}
          >
            <Icon size={19} />
            <b>{name}</b>
            <span>{detail}</span>
          </button>
        ))}
      </div>
      {automation.mode !== "manual" && (
        <>
          <div className="automation-pair">
            {["day", "night"].map((part) => (
              <div key={part} className="automation-period">
                <h3>
                  {part === "day" ? <Sun size={17} /> : <Moon size={17} />}{" "}
                  {part === "day" ? "Light hours" : "Quiet hours"}
                </h3>
                <label>
                  Appearance
                  <select
                    aria-label={`${part === "day" ? "Day" : "Night"} appearance`}
                    value={automation[`${part}Theme`]}
                    onChange={(e) =>
                      update({ [`${part}Theme`]: e.target.value })
                    }
                  >
                    {options()}
                  </select>
                </label>
                {automation.mode === "schedule" && (
                  <label>
                    Starts at
                    <input
                      type="time"
                      aria-label={`${part === "day" ? "Day" : "Night"} starts at`}
                      value={automation[`${part}Start`]}
                      onChange={(e) => {
                        if (e.target.value)
                          update({ [`${part}Start`]: e.target.value });
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          <div className="automation-status" role="status">
            <span className="live-dot" />
            <span>
              {period === "day" ? "Light hours" : "Quiet hours"}{" "}
              <ArrowRight size={12} /> <b>{current.name}</b>
            </span>
          </div>
          <p className="automation-note">
            {automation.mode === "schedule"
              ? "Uses this device’s local time. Overnight ranges work too. Times must be different; equal times reset to 07:00 / 19:00."
              : "Follows the operating system’s light/dark preference, not an individual website’s setting."}{" "}
            Updates within a minute on awake tabs, or when you return to a
            sleeping tab. Pinned site appearances stay unchanged.
          </p>
          <p className="automation-note">
            Curated palettes keep your current font, wallpaper, and glass.
            Profiles restore a complete saved look. Editing an appearance pauses
            automatic switching.
          </p>
        </>
      )}
    </section>
  );
}
export function useAppearanceClock() {
  const [clock, setClock] = React.useState(() => ({
    date: new Date(),
    systemDark: matchMedia("(prefers-color-scheme: dark)").matches,
  }));
  React.useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const refresh = () =>
      setClock({ date: new Date(), systemDark: media.matches });
    const interval = setInterval(refresh, 30000);
    media.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(interval);
      media.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return clock;
}
