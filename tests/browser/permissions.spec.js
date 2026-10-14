import { test, expect } from "@playwright/test";
async function mockExtension(
  page,
  { granted = true, broadAccess = false } = {},
) {
  await page.addInitScript(
    ({ granted, broadAccess }) => {
      window.__permissionCalls = [];
      window.__saved = {};
      window.__origins = [];
      window.browser = {
        runtime: { id: "dream-test", sendMessage: async () => ({ ok: true }) },
        storage: {
          local: {
            get: async () => __saved,
            set: async (v) => {
              __saved = v;
            },
          },
        },
        permissions: {
          request: async ({ origins }) => {
            __permissionCalls.push({ action: "request", origins });
            if (granted) __origins.push(...origins);
            return granted;
          },
          remove: async ({ origins }) => {
            __permissionCalls.push({ action: "remove", origins });
            __origins = __origins.filter((o) => !origins.includes(o));
            return true;
          },
          contains: async ({ origins }) =>
            broadAccess || origins.every((o) => __origins.includes(o)),
        },
      };
    },
    { granted, broadAccess },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Apply to websites" }).click();
}
test("grant then revoke uses exact origins and disables the saved site", async ({
  page,
}) => {
  await mockExtension(page);
  await page.getByRole("switch", { name: "Enable Dream on Gemini" }).click();
  await expect(
    page.getByRole("switch", { name: "Enable Dream on Gemini" }),
  ).toBeChecked();
  await page.waitForFunction(() => __saved.dream?.sites.gemini);
  await page
    .getByRole("button", { name: "Revoke access to Gemini", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revoke access", exact: true })
    .click();
  await expect(
    page.getByRole("switch", { name: "Enable Dream on Gemini" }),
  ).not.toBeChecked();
  await page.waitForFunction(() => __saved.dream?.sites.gemini === false);
  expect(await page.evaluate(() => __permissionCalls)).toEqual([
    { action: "request", origins: ["https://gemini.google.com/*"] },
    { action: "remove", origins: ["https://gemini.google.com/*"] },
  ]);
});
test("denied permissions never enable a site", async ({ page }) => {
  await mockExtension(page, { granted: false });
  await page.getByRole("switch", { name: "Enable Dream on Gemini" }).click();
  await expect(
    page.getByRole("switch", { name: "Enable Dream on Gemini" }),
  ).not.toBeChecked();
  await expect(page.getByRole("status")).toContainText(
    "Site access was not granted",
  );
});
test("broader browser permission is reported honestly after revoking an exact origin", async ({
  page,
}) => {
  await mockExtension(page, { broadAccess: true });
  await page.getByRole("switch", { name: "Enable Dream on Gemini" }).click();
  await page
    .getByRole("button", { name: "Revoke access to Gemini", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revoke access", exact: true })
    .click();
  await expect(
    page.getByRole("switch", { name: "Enable Dream on Gemini" }),
  ).not.toBeChecked();
  await expect(page.getByRole("status")).toContainText(
    "broader browser access remains",
  );
});
