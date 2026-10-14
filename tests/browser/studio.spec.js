import { test, expect } from "@playwright/test";
import path from "node:path";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
});
test("theme, colors, font, wallpaper and glass controls update the preview and persist", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: /Midnight ink For your after-hours/ })
    .click();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Background hex", exact: true })
    .fill("#123456");
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(18, 52, 86)",
  );
  await page.getByRole("tab", { name: "Typography", exact: true }).click();
  await page.getByRole("button", { name: /A timeless touch/ }).click();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "font-family",
    /Georgia/,
  );
  await page.getByRole("tab", { name: "Wallpaper", exact: true }).click();
  await page
    .getByRole("button", { name: "Lavender dunes", exact: true })
    .click();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-image",
    /dunes.jpg/,
  );
  await expect(
    page.getByRole("switch", { name: "Glass effect" }),
  ).toBeChecked();
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("dream"))?.theme.wallpaper === "dunes",
  );
  await page.reload();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(18, 52, 86)",
  );
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-image",
    /dunes.jpg/,
  );
  expect(errors).toEqual([]);
});
test("save, apply, delete profile; reset and undo", async ({ page }) => {
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Profile name" })
    .fill("My quiet space");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save profile", exact: true })
    .click();
  await page.getByRole("button", { name: /My profiles/ }).click();
  await expect(
    page.getByRole("heading", { name: "My quiet space" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use profile" }).click();
  await page.getByRole("button", { name: "Delete My quiet space" }).click();
  await page
    .getByRole("button", { name: "Delete profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your first mood is waiting." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page
    .getByRole("button", { name: /Midnight ink For your after-hours/ })
    .click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset appearance", exact: true })
    .click();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
  await page.getByRole("button", { name: "Undo appearance change" }).click();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
});
test("upload an image; export and import a backup", async ({ page }) => {
  await page.getByRole("tab", { name: "Wallpaper", exact: true }).click();
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(path.resolve("public/wallpapers/dunes.jpg"));
  await expect(
    page.getByRole("button", { name: /Your wallpaper is looking good/ }),
  ).toBeVisible();
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-image",
    /data:image\/jpeg/,
  );
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("dream-backup.json");
  const file = await download.path();
  await page.locator("input[type=file]").nth(1).setInputFiles(file);
  await expect(page.getByRole("status")).toContainText("Backup imported");
});
test("websites are searchable and permission requests are not faked in web preview", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Apply to websites" }).click();
  await expect(page.getByText("0 enabled", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Search websites" }).fill("qwen");
  await expect(page.locator(".site-row")).toHaveCount(1);
  await page.getByRole("switch", { name: "Enable Dream on Qwen" }).click();
  await expect(
    page.getByRole("dialog", { name: "Take Dream with you." }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download Chromium extension" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("dream-chromium.zip");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("switch", { name: "Enable Dream on Qwen" }),
  ).not.toBeChecked();
  await page
    .getByRole("textbox", { name: "Custom website" })
    .fill("https://example.com");
  await page.getByRole("button", { name: "Add website", exact: true }).click();
  await page.getByRole("textbox", { name: "Search websites" }).fill("example");
  await expect(page.locator(".site-row")).toHaveCount(1);
});
test("invalid JSON import does not overwrite current theme", async ({
  page,
}) => {
  await page
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"theme":null}'),
    });
  await expect(page.getByRole("status")).toContainText("isn’t a valid Dream");
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
});
test("desktop and mobile fit without horizontal overflow and navigation remains usable", async ({
  page,
}) => {
  await page.screenshot({
    path: "artifacts/dream-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Wallpapers", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Set a different scene." }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Wallpaper", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.screenshot({
    path: "artifacts/dream-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("system switching updates the preview and manual edits pause automation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /Follow your device/ }).click();
  await expect(page.locator(".automation-status")).toContainText(
    "Midnight ink",
  );
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await expect(page.locator(".automation-banner")).toContainText(
    "Following your device",
  );
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(23, 27, 36)",
  );
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(241, 237, 248)",
  );
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Background hex", exact: true })
    .fill("#abcdef");
  await expect(page.locator(".automation-banner")).toHaveCount(0);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".chat-preview")).toHaveCSS(
    "background-color",
    "rgb(171, 205, 239)",
  );
});
test("schedule supports profile references, rename and duplicate, and persists without overflow", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.getByRole("textbox", { name: "Profile name" }).fill("My mornings");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save profile", exact: true })
    .click();
  await page.getByRole("button", { name: /My profiles/ }).click();
  await page
    .getByRole("button", { name: "Duplicate My mornings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My mornings (copy)", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Rename My mornings", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Profile name" })
    .fill("Soft beginnings");
  await page
    .getByRole("button", { name: "Rename profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /Set a rhythm/ }).click();
  await page.getByLabel("Day starts at").fill("08:15");
  await page.getByLabel("Night starts at").fill("20:45");
  await page
    .getByLabel("Day appearance")
    .selectOption({ label: "Soft beginnings" });
  await page.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("dream"))?.automation.nightStart ===
      "20:45",
  );
  await page.screenshot({
    path: "artifacts/dream-automation.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/dream-automation-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Night starts at")).toHaveValue("20:45");
  await expect(
    page.getByLabel("Day appearance").locator("option:checked"),
  ).toHaveText("Soft beginnings");
});
test("contrast helper improves text pairs and custom website removal asks for confirmation", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Colors", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Main text hex", exact: true })
    .fill("#eeeeee");
  await page.getByRole("button", { name: "Improve text contrast" }).click();
  await expect(
    page.getByRole("textbox", { name: "Main text hex", exact: true }),
  ).not.toHaveValue("#eeeeee");
  await page.getByRole("button", { name: "Apply to websites" }).click();
  await page
    .getByRole("textbox", { name: "Custom website" })
    .fill("example.com");
  await page.getByRole("button", { name: "Add website", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove example.com", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep website", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove example.com", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove example.com", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove website", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove example.com", exact: true }),
  ).toHaveCount(0);
});
