import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
const out = "dist/chromium";
const { version } = JSON.parse(await readFile("package.json", "utf8"));
await mkdir(`${out}/icons`, { recursive: true });
for (const size of [16, 32, 48, 128])
  await sharp("public/icons/icon.svg")
    .resize(size, size)
    .png()
    .toFile(`${out}/icons/icon-${size}.png`);
const manifest = {
  manifest_version: 3,
  name: "Dream — Your colors. Your space.",
  version,
  description:
    "Personalize your favorite AI chats with colors, fonts, wallpapers, glass effects, and local profiles. Your layout stays yours.",
  permissions: ["storage", "scripting"],
  optional_host_permissions: ["https://*/*"],
  action: {
    default_title: "Open Dream Studio",
    default_icon: { 16: "icons/icon-16.png", 32: "icons/icon-32.png" },
  },
  icons: {
    16: "icons/icon-16.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  },
  options_ui: { page: "index.html", open_in_tab: true },
  background: { service_worker: "extension/background.js" },
  web_accessible_resources: [
    { resources: ["wallpapers/*"], matches: ["https://*/*"] },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'none';",
  },
  minimum_chrome_version: "120",
};
await writeFile(
  `${out}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
await cp("docs/INSTALL.md", `${out}/INSTALL.md`);
await cp("docs/PRIVACY.md", `${out}/PRIVACY.md`);
await rm("dist/firefox", { recursive: true, force: true });
await cp(out, "dist/firefox", { recursive: true });
const firefox = {
  ...manifest,
  background: { scripts: ["extension/core.js", "extension/background.js"] },
  browser_specific_settings: {
    gecko: {
      id: "dream@dream-extension.local",
      strict_min_version: "140.0",
      data_collection_permissions: { required: ["none"] },
    },
  },
};
delete firefox.minimum_chrome_version;
await writeFile(
  "dist/firefox/manifest.json",
  JSON.stringify(firefox, null, 2) + "\n",
);
await mkdir("artifacts", { recursive: true });
execFileSync("python3", [
  "-c",
  `import os,zipfile
for browser in ('chromium','firefox'):
 root='dist/'+browser
 with zipfile.ZipFile('artifacts/dream-'+browser+'.zip','w',zipfile.ZIP_DEFLATED) as z:
  for directory,_,files in os.walk(root):
   for filename in files:
    path=os.path.join(directory,filename)
    z.write(path,os.path.relpath(path,root))
`,
]);
console.log(
  "Packaged: artifacts/dream-chromium.zip and artifacts/dream-firefox.zip",
);
