import { test, expect } from "@playwright/test";
import path from "node:path";
const html = `<!doctype html><html><head><style>
body{margin:0;background:#181818;color:#eee;font:14px Arial}aside{width:160px;position:absolute;top:0;bottom:0;background:#222;border-right:1px solid #444}main{margin-left:160px;padding:24px;background:#1c1c1c;min-height:700px}p{max-width:600px}button{background:#4263e6;color:white;border:1px solid #999;padding:10px}textarea{background:#222;color:#ddd;width:400px;height:100px}pre{color:#e7e7e7;background:#202020}code span{color:rgb(250,100,100)}.bubble{width:380px;background:#333;border:1px solid #666;padding:15px;margin:10px}
</style></head><body><aside><h2>Chats</h2><a href="#history">History</a></aside><main><h1>Conversation</h1><p id="message">This conversation must remain untouched.</p><div class="bubble">Message bubble</div><button id="native">Native action</button><span id="clicked"></span><textarea aria-label="Message">Unsent draft</textarea><pre><code><span id="syntax">const dream = true;</span></code></pre><svg id="logo" width="30" height="30"><circle fill="red" cx="15" cy="15" r="10"/></svg><div id="dynamic"></div></main><script>document.querySelector('#native').onclick=()=>document.querySelector('#clicked').textContent='Works';</script></body></html>`;
async function install(page) {
  await page.route("https://chatgpt.com/dream-fixture", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: html }),
  );
  await page.goto("https://chatgpt.com/dream-fixture");
  await page.addScriptTag({ path: path.resolve("public/extension/core.js") });
  await page.evaluate(() => {
    window.__state = DreamCore.sanitizeState({
      sites: { chatgpt: true },
      theme: { ...DreamCore.DEFAULT_THEME, wallpaper: "none", glass: false },
    });
    window.__listeners = [];
    window.chrome = {
      storage: {
        local: { get: async () => ({ dream: window.__state }) },
        onChanged: { addListener: (fn) => window.__listeners.push(fn) },
      },
      runtime: { getURL: (s) => "http://127.0.0.1:5173/" + s },
    };
    window.__update = (patch) => {
      window.__state = { ...window.__state, ...patch };
      window.__listeners.forEach((fn) =>
        fn({ dream: { newValue: window.__state } }, "local"),
      );
    };
  });
  await page.addScriptTag({
    path: path.resolve("public/extension/content.js"),
  });
  await expect(page.locator("html")).toHaveAttribute("data-dream-active", "");
}
test("real DOM color engine preserves native layout, drafts, code, SVG and click behavior", async ({
  page,
}) => {
  await install(page);
  await expect(page.locator("main")).toHaveCSS("margin-left", "160px");
  await expect(page.locator("aside")).toHaveCSS("width", "160px");
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
  await expect(page.locator(".bubble")).toHaveCSS(
    "background-color",
    "rgb(252, 250, 255)",
  );
  await expect(page.locator("#message")).toHaveText(
    "This conversation must remain untouched.",
  );
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue(
    "Unsent draft",
  );
  await expect(page.locator("#syntax")).toHaveCSS(
    "color",
    "rgb(250, 100, 100)",
  );
  await expect(page.locator("#logo circle")).toHaveCSS(
    "fill",
    "rgb(255, 0, 0)",
  );
  await page.locator("#native").click();
  await expect(page.locator("#clicked")).toHaveText("Works");
  await page.evaluate(() => __update({ enabled: false }));
  await expect(page.locator("#dream-colors")).toHaveCount(0);
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(28, 28, 28)",
  );
  await expect(
    page.locator("[data-dream-bg],[data-dream-fg],[data-dream-code]"),
  ).toHaveCount(0);
});
test("dynamic content, palette updates, pinned themes, reinjection and site disable", async ({
  page,
}) => {
  await install(page);
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "bubble";
    el.textContent = "Streaming response";
    document.querySelector("#dynamic").append(el);
  });
  await expect(page.locator("#dynamic .bubble")).toHaveCSS(
    "background-color",
    "rgb(252, 250, 255)",
  );
  await page.evaluate(() =>
    __update({ theme: { ...__state.theme, ...DreamCore.PRESETS[1] } }),
  );
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
  await page.evaluate(() =>
    __update({
      siteThemes: { chatgpt: { ...__state.theme, ...DreamCore.PRESETS[2] } },
    }),
  );
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(238, 241, 232)",
  );
  await page.addScriptTag({
    path: path.resolve("public/extension/content.js"),
  });
  await expect(page.locator("#dream-colors")).toHaveCount(1);
  expect(await page.evaluate(() => __listeners.length)).toBe(1);
  await page.evaluate(() => __update({ sites: { chatgpt: false } }));
  await expect(page.locator("#dream-colors")).toHaveCount(0);
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(28, 28, 28)",
  );
});
test("large and streaming pages are processed in bounded batches and fully cleaned up", async ({
  page,
}) => {
  await install(page);
  await page.evaluate(() => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 900; i++) {
      const el = document.createElement("div");
      el.className = "bubble";
      el.textContent = `Reply ${i}`;
      frag.append(el);
    }
    document.querySelector("#dynamic").append(frag);
  });
  await expect(page.locator("#dynamic .bubble[data-dream-bg]")).toHaveCount(
    900,
  );
  await page.evaluate(() => __update({ enabled: false }));
  await expect(
    page.locator(
      "[data-dream-bg],[data-dream-fg],[data-dream-border],[data-dream-code]",
    ),
  ).toHaveCount(0);
});

test("accent buttons use readable text, including elements after the first classification batch", async ({
  page,
}) => {
  await install(page);
  const expected = await page.evaluate(() =>
    DreamCore.contrast(__state.theme.accent, "#ffffff") >=
    DreamCore.contrast(__state.theme.accent, "#15151a")
      ? "rgb(255, 255, 255)"
      : "rgb(21, 21, 26)",
  );
  await expect(page.locator("#native")).toHaveCSS("color", expected);
  await page.evaluate(() => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 510; i++) {
      const b = document.createElement("button");
      b.textContent = "Action";
      b.id = `action-${i}`;
      frag.append(b);
    }
    document.querySelector("#dynamic").append(frag);
  });
  await expect(page.locator("#action-509")).toHaveAttribute(
    "data-dream-bg",
    "accent",
  );
  await expect(page.locator("#action-509")).toHaveCSS("color", expected);
});
test("class updates, head stylesheet removal, and detached nodes are handled cleanly", async ({
  page,
}) => {
  await install(page);
  await page.evaluate(() => {
    const rules = document.createElement("style");
    rules.textContent =
      ".changed{background:rgb(50,90,240)!important;color:#ffffff!important}";
    document.head.append(rules);
    document.querySelector("#native").className = "changed";
    document.querySelector("#dream-colors").remove();
  });
  await expect(page.locator("#dream-colors")).toHaveCount(1);
  await expect(page.locator("#native")).toHaveAttribute(
    "data-dream-bg",
    "accent",
  );
  await page.evaluate(() => {
    window.__detached = document.querySelector(".bubble");
    __detached.remove();
    const el = document.createElement("p");
    el.textContent = "New reply";
    document.querySelector("main").append(el);
  });
  await expect
    .poll(() => page.evaluate(() => __detached.hasAttribute("data-dream-bg")))
    .toBe(false);
  await page.evaluate(() => __update({ enabled: false }));
  await page.evaluate(() => document.querySelector("main").append(__detached));
  await expect(page.locator(".bubble")).not.toHaveAttribute("data-dream-bg");
  await expect(page.locator(".bubble")).toHaveCSS(
    "background-color",
    "rgb(51, 51, 51)",
  );
});
test("system theme changes react live, while a pinned site stays unchanged", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await install(page);
  await page.evaluate(() => __update({ automation: { mode: "system" } }));
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
  await page.evaluate(() =>
    __update({
      siteThemes: { chatgpt: { ...__state.theme, ...DreamCore.PRESETS[2] } },
    }),
  );
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(238, 241, 232)",
  );
});
test("code links and explicitly styled ignored elements keep their native appearance", async ({
  page,
}) => {
  await install(page);
  await page.evaluate(() => {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "reference";
    link.id = "code-link";
    link.style.color = "rgb(20,200,120)";
    document.querySelector("code").append(link);
    const ignore = document.createElement("div");
    ignore.setAttribute("data-dream-ignore", "");
    ignore.innerHTML =
      '<p id="ignored" style="color:rgb(123,45,67);font-family:Georgia">Untouched</p>';
    document.querySelector("main").append(ignore);
  });
  await expect(page.locator("#code-link")).toHaveCSS(
    "color",
    "rgb(20, 200, 120)",
  );
  await expect(page.locator("#ignored")).toHaveCSS("color", "rgb(123, 45, 67)");
  await expect(page.locator("#ignored")).toHaveCSS("font-family", "Georgia");
});
test("scheduled theme crosses local-time boundaries without rewriting settings", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-14T18:59:45") });
  await install(page);
  await page.evaluate(() =>
    __update({
      automation: { mode: "schedule", dayStart: "07:00", nightStart: "19:00" },
    }),
  );
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
  await page.clock.fastForward(31000);
  await expect(page.locator("main")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
  expect(await page.evaluate(() => __state.theme.id)).toBe("lavender");
});

test("native icon fonts stay intact during font customization and markers are removed on pause", async ({
  page,
}) => {
  await install(page);
  await page.evaluate(() => {
    const icon = document.createElement("span");
    icon.id = "material-icon";
    icon.style.fontFamily = '"Material Symbols Outlined"';
    icon.textContent = "menu";
    document.querySelector("main").append(icon);
    __update({ theme: { ...__state.theme, font: "serif" } });
  });
  await expect(page.locator("#material-icon")).toHaveAttribute(
    "data-dream-icon-font",
    "",
  );
  await expect(page.locator("#material-icon")).toHaveCSS(
    "font-family",
    '"Material Symbols Outlined"',
  );
  await page.evaluate(() => __update({ enabled: false }));
  await expect(page.locator("[data-dream-icon-font]")).toHaveCount(0);
});
