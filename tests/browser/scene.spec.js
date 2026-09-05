import { test, expect } from "@playwright/test";
const errors = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
});
test.afterEach(() => expect(errors).toEqual([]));
test("WebGL scene, three camera presets, pause, settings, launch and text queue", async ({
  page,
}) => {
  await expect(page.locator("#error")).toBeHidden();
  const canvas = page.locator("#scene");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "일시 정지", exact: true }).click();
  const time = await page.locator("#elapsed").innerText();
  await page.waitForTimeout(350);
  await expect(page.locator("#elapsed")).toHaveText(time);
  for (const view of ["tower", "heli", "river"]) {
    await page.locator(`[data-view=${view}]`).click();
    await expect(page.locator(`[data-view=${view}]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await page.getByRole("button", { name: "장면 설정", exact: true }).click();
  await expect(page.locator("#settings")).toBeVisible();
  await page.selectOption("#pattern", "galaxy");
  await expect(page.locator("#show-name")).toHaveText("갤럭시 · 별의 물결");
  await page.locator("#dof").fill("80");
  await expect(page.locator("#dof-value")).toHaveText("80%");
  await page.locator("#focus").fill("300");
  await expect(page.locator("#autofocus")).not.toBeChecked();
  await page.locator("#water").fill("90");
  await page.selectOption("#quality", "high");
  await page.locator("#message").fill("서울");
  await page.getByRole("button", { name: "쏘기", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("영문과 숫자");
  await page.locator("#message").fill("SEOUL 2026");
  await page.getByRole("button", { name: "쏘기", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("다음 시퀀스");
  await page.getByRole("button", { name: "설정 닫기" }).click();
  await page.getByRole("button", { name: "불꽃 쏘기", exact: false }).click();
  await expect(page.locator("#pause")).toHaveAttribute(
    "aria-label",
    "일시 정지",
  );
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "몰입 모드", exact: true }).click();
  await expect(page.locator("#app")).toHaveClass("immersed");
  await page.keyboard.press("Escape");
  await expect(page.locator("#app")).not.toHaveClass("immersed");
});
test("every effect runs and mobile controls fit the viewport", async ({
  page,
}) => {
  await page.getByRole("button", { name: "장면 설정", exact: true }).click();
  for (const pattern of ["massive", "galaxy", "basic", "willow"]) {
    await page.selectOption("#pattern", pattern);
    await page.selectOption(
      "#ground-program",
      { smile: "fan", massive: "cross", galaxy: "chase", basic: "vertical" }[
        pattern
      ] || "auto",
    );
    await page.getByRole("button", { name: "설정 닫기" }).click();
    await page.getByRole("button", { name: "불꽃 쏘기", exact: false }).click();
    await page.waitForTimeout(3400);
    await page.getByRole("button", { name: "장면 설정", exact: true }).click();
  }
  await page.locator("#dof").fill("0");
  await page.locator("#bloom").fill("0");
  await page.selectOption("#quality", "low");
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "설정 닫기" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const sel of [".control-deck", ".masthead"]) {
    const rect = await page.locator(sel).boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  }
  await page.getByRole("button", { name: "장면 설정", exact: true }).click();
  const rect = await page.locator("#settings").boundingBox();
  expect(rect.y + rect.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: "/tmp/firework-review/mobile.png" });
});
test("reduced motion starts paused and keyboard controls work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?text=SEOUL");
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#pause")).toHaveAttribute("aria-label", "재생");
  await page.keyboard.press("2");
  await expect(page.locator("[data-view=tower]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("Space");
  await expect(page.locator("#pause")).toHaveAttribute(
    "aria-label",
    "일시 정지",
  );
});

test("automatic program handover starts while the previous fireworks are still fading", async ({
  page,
}) => {
  await expect(page.locator("#show-name")).toHaveText("구형 · 빛의 합주");
  await expect(page.locator("#show-name")).not.toHaveText("구형 · 빛의 합주", {
    timeout: 15000,
  });
  const progress = parseFloat(
    (await page.locator("#progress-fill").getAttribute("style")).match(
      /[\d.]+/,
    )[0],
  );
  expect(progress).toBeLessThan(15);
  await expect(page.locator("#pause")).toHaveAttribute(
    "aria-label",
    "일시 정지",
  );
  await expect(page.locator("#error")).toBeHidden();
});
