const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
function setup(state = {}, grants = []) {
  const events = {};
  const calls = {
    register: [],
    update: [],
    inject: [],
    removed: [],
    query: [],
  };
  let scripts = [];
  let saved = state;
  const event = (name) => ({ addListener: (fn) => (events[name] = fn) });
  const api = {
    runtime: {
      id: "dream-test",
      onInstalled: event("installed"),
      onStartup: event("startup"),
      onMessage: event("message"),
      openOptionsPage: async () => {},
    },
    storage: {
      local: {
        get: async () => ({ dream: saved }),
        set: async (value) => {
          saved = value.dream;
          events.storage?.({ dream: { newValue: saved } }, "local");
        },
      },
      onChanged: event("storage"),
    },
    permissions: {
      getAll: async () => ({ origins: grants }),
      onAdded: event("added"),
      onRemoved: event("removed"),
    },
    action: { onClicked: event("clicked") },
    scripting: {
      getRegisteredContentScripts: async () => scripts,
      registerContentScripts: async (value) => {
        calls.register.push(value);
        scripts = value;
      },
      updateContentScripts: async (value) => {
        calls.update.push(value);
        scripts = value;
      },
      unregisterContentScripts: async (value) => {
        calls.removed.push(value);
        scripts = [];
      },
      executeScript: async (value) => calls.inject.push(value),
    },
    tabs: {
      query: async (options) => {
        calls.query.push(options);
        return [{ id: 5 }];
      },
    },
  };
  const context = vm.createContext({ URL, chrome: api, console });
  vm.runInContext(fs.readFileSync("public/extension/core.js", "utf8"), context);
  vm.runInContext(
    fs.readFileSync("public/extension/background.js", "utf8"),
    context,
  );
  return {
    calls,
    events,
    get saved() {
      return saved;
    },
    set saved(v) {
      saved = v;
    },
    sync: () => vm.runInContext("sync()", context),
  };
}
test("background never injects into a site without host permission", async () => {
  const s = setup({ sites: { chatgpt: true } });
  await s.sync();
  assert.equal(s.calls.register.length, 0);
  assert.equal(s.calls.inject.length, 0);
});
test("background registers only enabled and explicitly granted origins", async () => {
  const s = setup({ sites: { chatgpt: true, gemini: true } }, [
    "https://chatgpt.com/*",
  ]);
  await s.sync();
  assert.deepEqual(Array.from(s.calls.register[0][0].matches), [
    "https://chatgpt.com/*",
  ]);
  assert.equal(s.calls.inject[0].target.tabId, 5);
  assert.equal(s.calls.register[0][0].allFrames, false);
});
test("unchanged settings avoid reinjection and global pause unregisters it", async () => {
  const s = setup({ sites: { chatgpt: true } }, ["https://chatgpt.com/*"]);
  await s.sync();
  await s.sync();
  assert.equal(s.calls.register.length, 1);
  assert.equal(s.calls.update.length, 0);
  assert.equal(s.calls.inject.length, 1);
  s.saved = { ...s.saved, enabled: false };
  await s.sync();
  assert.equal(s.calls.removed.length, 1);
});
test("revoking permission disables site in storage, restoring active pages via storage events", async () => {
  const s = setup({ sites: { chatgpt: true, gemini: true } }, [
    "https://chatgpt.com/*",
    "https://gemini.google.com/*",
  ]);
  await s.sync();
  await s.events.removed({ origins: ["https://chatgpt.com/*"] });
  assert.equal(s.saved.sites.chatgpt, false);
  assert.equal(s.saved.sites.gemini, true);
});
test("messages from another extension cannot trigger synchronization", async () => {
  const s = setup();
  const result = s.events.message(
    { type: "DREAM_SYNC" },
    { id: "other-extension" },
    () => assert.fail("should not reply"),
  );
  assert.equal(result, undefined);
  assert.equal(s.calls.register.length, 0);
});

test("extension updates force refreshed script injection even with unchanged hosts", async () => {
  const s = setup({ sites: { chatgpt: true } }, ["https://chatgpt.com/*"]);
  await s.sync();
  await s.events.installed();
  assert.equal(s.calls.update.length, 1);
  assert.equal(s.calls.inject.length, 2);
});
test("adding another site updates registration rather than duplicating scripts", async () => {
  const s = setup({ sites: { chatgpt: true } }, [
    "https://chatgpt.com/*",
    "https://gemini.google.com/*",
  ]);
  await s.sync();
  s.saved = { ...s.saved, sites: { chatgpt: true, gemini: true } };
  await s.sync();
  assert.equal(s.calls.register.length, 1);
  assert.equal(s.calls.update.length, 1);
  assert.equal(s.calls.update[0][0].matches.length, 2);
});
