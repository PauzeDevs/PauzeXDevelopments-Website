const { test, expect } = require("@playwright/test");
const baseURL = process.env.PX_TEST_URL || "http://127.0.0.1:4173";

async function solveGate(page) {
  await expect(page.locator("#px-verify-gate")).toBeVisible();
  await page.locator("#px-verify-human").check();
  await page.locator("#px-verify-primary").click();
  await expect(page.locator("#px-verify-extra")).toBeVisible();
  const options = page.locator(".px-verify-option");
  expect(await options.count()).toBe(4);
  const targetFrom = async () => (await page.locator("#px-verify-prompt").textContent()).split(":").pop().trim();
  let target = await targetFrom();
  await options.filter({ hasNotText: target }).first().click();
  await expect(page.locator("#px-verify-status")).toContainText("additional check is required");
  target = await targetFrom();
  await options.filter({ hasText: target }).first().click();
  await expect(page.locator("#px-verify-gate")).toBeHidden();
}

test("first visit challenge, retry and successful unlock", async ({ page }) => {
  await page.goto(baseURL);
  await solveGate(page);
  await expect(page.locator("#site-header")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#main")).not.toHaveAttribute("inert", "");
});

test("tenth counted tab is challenged", async ({ browser }) => {
  const context = await browser.newContext();
  let page = await context.newPage();
  await page.goto(baseURL);
  await solveGate(page);
  await page.close();
  for (let visit = 2; visit <= 9; visit += 1) {
    page = await context.newPage();
    await page.goto(baseURL);
    await expect(page.locator("#px-verify-gate")).toBeHidden();
    await page.close();
  }
  page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator("#px-verify-gate")).toBeVisible();
  await solveGate(page);
  await context.close();
});

test("verification persists after reload in the same tab", async ({ page }) => {
  await page.goto(baseURL);
  await solveGate(page);
  await page.reload();
  await expect(page.locator("#px-verify-gate")).toBeHidden();
});

test("production layout keeps overlays fixed and project tools outside the title row", async ({ page }) => {
  await page.goto(baseURL);
  const gate = page.locator("#px-verify-gate");
  if (await gate.isVisible()) await solveGate(page);
  await page.locator("#skip-intro").click().catch(() => {});
  const positions = await page.evaluate(() => ({
    banner: getComputedStyle(document.querySelector("#cookie-banner")).position,
    dialog: getComputedStyle(document.querySelector("#cookie-dialog")).position,
    skip: getComputedStyle(document.querySelector("#skip-link")).position,
    toolsParent: document.querySelector(".project-tools")?.parentElement?.className
  }));
  expect(positions.banner).toBe("fixed");
  expect(positions.dialog).toBe("fixed");
  expect(positions.skip).toBe("fixed");
  expect(positions.toolsParent).not.toContain("work-title-row");
  const missingAsset = await page.request.get(baseURL + "/missing-test-asset.js");
  expect(missingAsset.status()).toBe(404);
});
