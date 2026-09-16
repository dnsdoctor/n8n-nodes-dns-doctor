// Off-camera preparation of a fresh n8n: owner account + the first-run modals dismissed.
import { chromium } from "playwright";
const BASE = "http://localhost:5678"; const PW = process.env.N8N_PW;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(`${BASE}/setup`, { waitUntil: "networkidle" });
try {
  await page.getByRole("textbox", { name: /Email/ }).waitFor({ state: "visible", timeout: 90000 });
} catch (e) {
  await page.screenshot({ path: "setup-fail.png" }); console.error("setup page:", page.url()); throw e;
}
await page.getByRole("textbox", { name: /Email/ }).fill("hello@dnsdoctor.dev");
await page.getByRole("textbox", { name: /First Name/ }).fill("DNS");
await page.getByRole("textbox", { name: /Last Name/ }).fill("Doctor");
await page.getByRole("textbox", { name: /Password/ }).fill(PW);
await page.locator('[data-test-id="form-submit-button"]').click();
await page.waitForURL((u) => !u.pathname.startsWith("/setup"), { timeout: 30000 });
await page.getByRole("button", { name: "Get started" }).click({ timeout: 15000 }).catch(() => {});
await page.goto(`${BASE}/workflow/new`);
await page.getByRole("button", { name: "Skip" }).click({ timeout: 15000 }).catch(() => {});
await page.goto(`${BASE}/workflow/new`);
const modal = await page.getByRole("dialog").first().isVisible().catch(() => false);
console.log("setup done; modal still visible:", modal);
await browser.close();
