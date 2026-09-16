// One continuous Playwright take of the n8n demo for the Creator Portal review,
// against the msi n8n container through the SSH tunnel (localhost:5678).
// Env: N8N_PW (owner password), DNSD_TOKEN (DNS Doctor API token; masked input),
// DRY=1 (no video, skip install if present, skip credential without a token,
// screenshot every step into shots/).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:5678";
const DOMAIN = "dnsdoctor.dev";
const PW = process.env.N8N_PW, TOKEN = process.env.DNSD_TOKEN, DRY = !!process.env.DRY;
if (!PW) throw new Error("N8N_PW is required");
if (!DRY && !TOKEN) throw new Error("DNSD_TOKEN is required for the real take");
const pace = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync("videos", { recursive: true }); mkdirSync("shots", { recursive: true });
let n = 0;
const shot = async (page, name) => { if (DRY) await page.screenshot({ path: `shots/${String(++n).padStart(2, "0")}-${name}.png` }); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ...(DRY ? {} : { recordVideo: { dir: "videos", size: { width: 1600, height: 1000 } } }),
});
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
try {

// ── Sign in ──
await page.goto(`${BASE}/signin`);
await page.getByRole("textbox", { name: /Email/ }).fill("hello@dnsdoctor.dev");
await page.getByRole("textbox", { name: /Password/ }).fill(PW);
await page.locator('[data-test-id="form-submit-button"]').click();
await page.waitForURL((u) => !u.pathname.startsWith("/signin"), { timeout: 30000 });
await pace(1500); await shot(page, "signed-in");

const SKIP = process.env.SKIP_TO_AGENT === "1";
if (!SKIP) {
// ── 1. Install the node from npm (the submitted version) ──
// In-app navigation only from here on: a hard page load paints white for a
// second or two on every route, which reads as a cut in the recording.
await page.getByRole("menuitem", { name: "Settings" }).click();
await pace(1000);
await page.getByRole("menuitem", { name: "Community nodes" }).click();
await pace(1500);
const installed = await page.getByText("n8n-nodes-dns-doctor").first().isVisible().catch(() => false);
if (!installed) {
  await page.getByRole("button", { name: /Install/ }).first().click();
  await page.locator('[data-test-id="package-name-input"]').pressSequentially("n8n-nodes-dns-doctor", { delay: 60 });
  await pace(600);
  await page.locator('[data-test-id="user-agreement-checkbox"]').check();
  await pace(600);
  await page.locator('[data-test-id="install-community-package-button"]').click();
  await page.getByText("v0.1.0").first().waitFor({ state: "visible", timeout: 180000 });
} else if (!DRY) { throw new Error("node already installed — uninstall before the real take"); }
await pace(2500); await shot(page, "installed");

// ── 2. New workflow: manual trigger → DNS Doctor · Scan (no credential) ──
await page.getByText("Settings", { exact: true }).first().click(); // the settings rail's back control
await pace(800);
await page.getByRole("menuitem", { name: "Overview" }).click();
await pace(800);
await page.getByRole("button", { name: "Create workflow" }).first().click();
await pace(1200);
await page.locator('[data-test-id="canvas-plus-button"]').click();
await page.getByText("Trigger manually").first().click();
await pace(800);
await page.locator('[data-test-id="node-creator-plus-button"]').click();
await page.locator('[data-test-id="node-creator-search-bar"]').pressSequentially("DNS Doctor", { delay: 70 });
await pace(800);
await page.locator('[data-test-id="node-creator-action-item"]').first().click();
await pace(2500); await shot(page, "node-details");
await page.locator("div").filter({ hasText: /^Scan a domain$/ }).first().click();
await pace(800);
await page.locator('[data-test-id="parameter-input-domain"] [data-test-id="parameter-input-field"]').pressSequentially(DOMAIN, { delay: 60 });
await pace(400);
await page.locator('[data-test-id="node-execute-button"]').click();
await page.getByText("checks").first().waitFor({ state: "visible", timeout: 120000 });
await pace(3500); await shot(page, "scan-output");

// ── 3. Credential: create in the node; n8n tests it on save ──
if (TOKEN) {
  await page.getByRole("button", { name: "Connect to DNS Doctor" }).click();
  await pace(800);
  const tokenField = page.locator('[data-test-id="credential-edit-dialog"] input[type="password"]').first();
  await tokenField.click();
  await tokenField.pressSequentially(TOKEN, { delay: 10 });
  await pace(500);
  await page.locator('[data-test-id="credential-save-button"]').click();
  // n8n runs the test on save, flashes "Connection tested successfully" and closes
  // the dialog itself; the credential then shows as selected in the node.
  await page.getByText(/tested successfully/i).first().waitFor({ state: "attached", timeout: 60000 }).catch(() => {});
  await page.locator('[data-test-id="credential-edit-dialog"]').waitFor({ state: "hidden", timeout: 60000 }).catch(() => {});
  await pace(2500); await shot(page, "credential-ok");
}

// ── 4. Common actions in the same node: Monitoring · Get Alerts, then Tool · Check Propagation ──
async function pick(param, option) {
  await page.locator(`[data-test-id="parameter-input-${param}"] input`).first().click();
  await pace(300);
  await page.getByRole("option", { name: option }).first().click();
  await pace(400);
}
await pick("resource", "Monitoring");
await pick("operation", "Get Readiness"); // scoped to ONE domain: the account-wide alert log would show other domains
const readinessDomain = page.locator('[data-test-id="parameter-input-domain"] [data-test-id="parameter-input-field"]');
await readinessDomain.click(); await pace(300);
await readinessDomain.fill(DOMAIN); await pace(600);
if ((await readinessDomain.inputValue()) !== DOMAIN) { await readinessDomain.fill(DOMAIN); await pace(400); }
await pace(600); await shot(page, "readiness-params");
if (TOKEN) {
  await page.locator('[data-test-id="node-execute-button"]').click();
  await page.getByText(/ready|stage|blockers/i).first().waitFor({ state: "visible", timeout: 60000 }).catch(() => {});
  await pace(1500);
  await page.getByRole("radio", { name: "Schema" }).last().click();
  await pace(3500); await shot(page, "readiness-output");
}
await pick("resource", "Tool");
await pick("operation", "Check Propagation"); // its target field is "Name" (a hostname, www. kept)
const nameField = page.locator('[data-test-id="parameter-input-name"] [data-test-id="parameter-input-field"]');
await nameField.click(); await pace(300);
await nameField.fill(DOMAIN); // one fill: n8n re-mounts this input on the first keystroke, so per-key typing loses characters
await pace(600);
if ((await nameField.inputValue()) !== DOMAIN) { await nameField.fill(DOMAIN); await pace(400); }
await page.locator('[data-test-id="node-execute-button"]').click();
await page.getByText(/vantages|verdict/i).first().waitFor({ state: "visible", timeout: 120000 });
await pace(1500);
// The Table view clips the six-location grid; the Schema view lists it in full.
await page.getByRole("radio", { name: "Schema" }).last().click();
await pace(4500); await shot(page, "propagation-output");
await page.keyboard.press("Escape");
await pace(800);
}

// ── 5. As an AI Agent tool: new workflow, chat trigger → AI Agent → OpenAI + DNS Doctor Tool → chat ──
await page.getByRole("menuitem", { name: "Overview" }).click();
await pace(800);
await page.getByRole("button", { name: /Leave without saving|Leave/ }).click({ timeout: 3000 }).catch(() => {});
await pace(800);
await page.getByRole("button", { name: "Create workflow" }).first().click();
await pace(1200);
await page.locator('[data-test-id="canvas-plus-button"]').click();
await page.getByText("On chat message").first().click();
await pace(1000);
await page.keyboard.press("Escape"); // close the trigger's NDV if it opened
await pace(600);
await page.locator('[data-test-id="node-creator-plus-button"]').click();
await page.locator('[data-test-id="node-creator-search-bar"]').pressSequentially("AI Agent", { delay: 70 });
await pace(800);
await page.getByText(/^AI Agent/).first().click();
await pace(1200);
// chat model
await page.locator('[data-test-id="add-subnode-ai_languageModel-0"]').click();
await page.getByText("OpenAI Chat Model", { exact: true }).first().click();
await pace(1500); await shot(page, "openai-model");
await page.keyboard.press("Escape");
await pace(600);
// tool
await page.locator('[data-test-id="canvas-node-input-handle"]').filter({ hasText: /Tool/ }).first().click().catch(async () => {
  await page.getByText("Tool", { exact: true }).first().click();
});
await page.locator('[data-test-id="node-creator-search-bar"]').pressSequentially("DNS Doctor", { delay: 70 });
await pace(800);
await page.getByText(/^DNS Doctor Tool/).first().click();
await pace(1200);
await page.locator('[data-test-id="from-ai-override-button"]').first().click(); // domain: let the model define it
await pace(1500); await shot(page, "tool-configured");
await page.keyboard.press("Escape");
await pace(800); await shot(page, "agent-canvas");
// chat
await page.locator('[data-test-id="workflow-chat-button"]').click();
await pace(1200); await shot(page, "chat-open");
const chatInput = page.getByPlaceholder(/Type message/);
await chatInput.click();
await chatInput.fill(`Is DMARC set up correctly for ${DOMAIN}?`);
await pace(600);
await page.keyboard.press("Enter");
// the agent calls the tool, then answers; wait for a reply mentioning the policy
await page.getByText(/Running for/).first().waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
await page.getByText(/Running for/).first().waitFor({ state: "hidden", timeout: 240000 }).catch(() => {});
await pace(7000); await shot(page, "chat-answer");

await pace(1500);
} catch (e) {
  await page.screenshot({ path: "shots/fail.png" }).catch(() => {});
  console.error("FAILED at:", e.message);
  await page.close(); await ctx.close(); await browser.close();
  process.exit(1);
}
const video = DRY ? null : await page.video()?.path();
await page.close(); await ctx.close(); await browser.close();
console.log("DONE", video ?? "(dry run, see shots/)");
