import { test, expect } from "@playwright/test"
import { viewports } from "./viewports"

for (const [size, viewport] of Object.entries(viewports)) {
  test.describe(`FootprintDialog tests - ${size} viewport`, () => {
    let isMobileOrTablet: boolean

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto("http://127.0.0.1:5177/editor")
      await page.waitForSelector("button.run-button")
      isMobileOrTablet = page.viewportSize()?.width! <= 768
    })

    test("opens footprint dialog and shows preview", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }

      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")

      await expect(page.getByRole("dialog")).toBeVisible()
      await expect(page.getByRole("heading", { name: "Insert" })).toBeVisible()
    })

    test("footprint selection and preview updates", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }

      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")

      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "ms012" }).click()

      await expect(
        page.locator(".rounded-xl.overflow-hidden svg"),
      ).toBeVisible()

      await expect(page).toHaveScreenshot(`footprint-preview-${size}.png`)
    })

    test("chip name input", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }

      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")

      await page.fill(
        'input[placeholder="Enter chip name (e.g., U1)..."]',
        "U1",
      )

      await expect(
        page.locator('input[placeholder="Enter chip name (e.g., U1)..."]'),
      ).toHaveValue("U1")
    })

    test("inserts footprint into code", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }

      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")

      await page.fill(
        'input[placeholder="Enter chip name (e.g., U1)..."]',
        "U1",
      )
      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "ms012" }).click()

      await page.click('button:has-text("Insert Footprint")')

      await page.waitForSelector('[role="dialog"]', {
        state: "hidden",
        timeout: 5000,
      })

      await expect(page.locator(".cm-content")).toContainText("<chip")
      await expect(page.locator(".cm-content")).toContainText('name="U1"')
    })

    test("parameter controls update preview", async ({ page }) => {
      if (isMobileOrTablet) {
        await page.click('button:has-text("Show Code")')
      }

      await page.click('button:has-text("Insert")')
      await page.click("text=Footprint")
      await expect(page.getByRole("dialog")).toBeVisible()

      await page.getByRole("combobox").click()
      await page.getByRole("option", { name: "dip" }).click()

      await page.fill('label:has-text("Number of Pins") + input', "16")
      const previewContainer = page.locator(".rounded-xl.overflow-hidden svg")
      const initialPreview = await previewContainer.innerHTML()

      await page.fill('label:has-text("Number of Pins") + input', "22")

      await page.waitForTimeout(500)

      const updatedPreview = await previewContainer.innerHTML()

      expect(initialPreview).not.toEqual(updatedPreview)
    })
  })
}
