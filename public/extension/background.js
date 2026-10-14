if (!globalThis.DreamCore && typeof importScripts === "function")
  importScripts("core.js");
const api = globalThis.browser || globalThis.chrome;
const C = globalThis.DreamCore;
let queue = Promise.resolve();
async function reconcile(force = false) {
  const saved = await api.storage.local.get("dream");
  const state = C.sanitizeState(saved.dream);
  const granted = await api.permissions.getAll();
  const origins = granted.origins || [];
  const matches = state.enabled
    ? Object.keys(state.sites)
        .filter((k) => state.sites[k])
        .flatMap(C.originsFor)
        .filter(
          (o) =>
            origins.includes(o) ||
            origins.includes("https://*/*") ||
            origins.includes("*://*/*") ||
            origins.includes("<all_urls>"),
        )
    : [];
  const existing = await api.scripting.getRegisteredContentScripts({
    ids: ["dream-enabled"],
  });
  if (matches.length) {
    const script = {
      id: "dream-enabled",
      matches: [...new Set(matches)],
      js: ["extension/core.js", "extension/content.js"],
      runAt: "document_idle",
      allFrames: false,
      persistAcrossSessions: true,
    };
    const previous = existing[0]?.matches || [];
    const unchanged =
      previous.length === script.matches.length &&
      script.matches.every((m) => previous.includes(m));
    if (unchanged && !force) return;
    if (existing.length) await api.scripting.updateContentScripts([script]);
    else await api.scripting.registerContentScripts([script]);
    const tabs = await api.tabs.query({ url: script.matches });
    await Promise.all(
      tabs
        .filter((t) => t.id)
        .map((t) =>
          api.scripting
            .executeScript({ target: { tabId: t.id }, files: script.js })
            .catch(() => {}),
        ),
    );
  } else if (existing.length)
    await api.scripting.unregisterContentScripts({ ids: ["dream-enabled"] });
}
function sync(force = false) {
  queue = queue.catch(() => {}).then(() => reconcile(force));
  return queue;
}
api.runtime.onInstalled.addListener(() => sync(true).catch(console.warn));
api.runtime.onStartup.addListener(() => sync().catch(console.warn));
api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.dream) sync().catch(console.warn);
});
api.permissions.onAdded.addListener(() => sync().catch(console.warn));
api.permissions.onRemoved.addListener(async (removed) => {
  try {
    const saved = await api.storage.local.get("dream");
    const state = C.sanitizeState(saved.dream);
    const origins = removed.origins || [];
    for (const id of Object.keys(state.sites)) {
      if (
        C.originsFor(id).some((o) => origins.includes(o)) ||
        origins.includes("https://*/*") ||
        origins.includes("*://*/*") ||
        origins.includes("<all_urls>")
      )
        state.sites[id] = false;
    }
    // A storage event also removes styles from already-open content scripts.
    await api.storage.local.set({ dream: state });
    await sync();
  } catch (e) {
    console.warn(e);
  }
});
api.action.onClicked.addListener(() => api.runtime.openOptionsPage());
api.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== "DREAM_SYNC" || sender.id !== api.runtime.id) return;
  sync()
    .then(() => respond({ ok: true }))
    .catch((e) => respond({ ok: false, error: e.message }));
  return true;
});
