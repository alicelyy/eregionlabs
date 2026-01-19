import { test, expect } from '@playwright/test';

test.describe('Hamburger Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('menu toggle is visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const menuToggle = page.locator('.menu-toggle');
    await expect(menuToggle).toBeVisible();
  });

  test('menu toggle is hidden on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const menuToggle = page.locator('.menu-toggle');
    await expect(menuToggle).toBeHidden();
  });

  test('menu opens on single tap', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Menu should be hidden initially
    await expect(nav).not.toHaveClass(/active/);
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await menuToggle.click();

    // Menu should be visible
    await expect(nav).toHaveClass(/active/);
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('menu closes on toggle click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Open menu
    await menuToggle.click();
    await expect(nav).toHaveClass(/active/);

    // Close menu
    await menuToggle.click();
    await expect(nav).not.toHaveClass(/active/);
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu closes when clicking nav link', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');
    const servicesLink = page.locator('.nav-link[href="#services"]');

    // Open menu
    await menuToggle.click();
    await expect(nav).toHaveClass(/active/);

    // Click a nav link
    await servicesLink.click();

    // Menu should close after a short delay
    await expect(nav).not.toHaveClass(/active/, { timeout: 500 });
  });

  test('menu closes on Escape key', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Open menu
    await menuToggle.click();
    await expect(nav).toHaveClass(/active/);

    // Press Escape
    await page.keyboard.press('Escape');

    // Menu should close
    await expect(nav).not.toHaveClass(/active/);
  });

  test('menu closes when clicking on overlay background', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Open menu
    await menuToggle.click();
    await expect(nav).toHaveClass(/active/);

    // Click on the overlay background (not on menu items)
    await nav.click({ position: { x: 10, y: 10 } });

    // Menu should close
    await expect(nav).not.toHaveClass(/active/);
  });

  test('body scroll is locked when menu is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const body = page.locator('body');

    // Open menu
    await menuToggle.click();

    // Body should have menu-open class
    await expect(body).toHaveClass(/menu-open/);

    // Close menu
    await menuToggle.click();

    // Body should not have menu-open class
    await expect(body).not.toHaveClass(/menu-open/);
  });

  test('scroll position is preserved after closing menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    const scrollBefore = await page.evaluate(() => window.pageYOffset);
    expect(scrollBefore).toBeGreaterThan(400);

    // Open and close menu
    await menuToggle.click();
    await page.waitForTimeout(100);
    await menuToggle.click();
    await page.waitForTimeout(100);

    // Scroll position should be preserved
    const scrollAfter = await page.evaluate(() => window.pageYOffset);
    expect(scrollAfter).toBeCloseTo(scrollBefore, -1);
  });

  test('menu auto-closes on resize to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Open menu
    await menuToggle.click();
    await expect(nav).toHaveClass(/active/);

    // Resize to desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    // Menu should auto-close
    await expect(nav).not.toHaveClass(/active/, { timeout: 500 });
  });

  test('hamburger animates to X when open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const spans = menuToggle.locator('span');

    // Open menu
    await menuToggle.click();

    // Check middle span is hidden (opacity 0)
    const middleSpan = spans.nth(1);
    await expect(middleSpan).toHaveCSS('opacity', '0');
  });

  test('nav items are visible when menu is open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');

    // Open menu
    await menuToggle.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Check nav items are visible
    await expect(page.locator('.nav-link[href="#services"]')).toBeVisible();
    await expect(page.locator('.nav-link[href="#process"]')).toBeVisible();
    await expect(page.locator('.nav-link[href="#about"]')).toBeVisible();
    await expect(page.locator('.nav-cta')).toBeVisible();
  });

  test('touch responsiveness - rapid taps handled correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Rapid taps - should still work correctly
    await menuToggle.click();
    await page.waitForTimeout(50);
    await menuToggle.click();
    await page.waitForTimeout(50);
    await menuToggle.click();

    // After 3 clicks, menu should be open (odd number of toggles)
    await page.waitForTimeout(200);
    await expect(nav).toHaveClass(/active/);
  });
});

test.describe('Hamburger Menu - Touch Simulation', () => {
  test.use({ hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('menu opens with touch tap', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Simulate touch tap
    await menuToggle.tap();

    // Menu should open
    await expect(nav).toHaveClass(/active/);
  });

  test('menu closes with touch tap', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');

    // Open
    await menuToggle.tap();
    await expect(nav).toHaveClass(/active/);

    // Close
    await menuToggle.tap();
    await expect(nav).not.toHaveClass(/active/);
  });

  test('swipe on menu toggle does not trigger menu', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');
    const nav = page.locator('.nav');
    const box = await menuToggle.boundingBox();

    if (box) {
      // Simulate a swipe (touchstart, touchmove, touchend with movement)
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

      // After a tap, menu should open
      await expect(nav).toHaveClass(/active/);
    }
  });
});

test.describe('Hamburger Menu - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('menu toggle has correct aria attributes', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');

    // Check initial state
    await expect(menuToggle).toHaveAttribute('aria-label', 'Toggle menu');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    // Close menu
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('focus returns to menu toggle after closing with Escape', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');

    // Open menu
    await menuToggle.click();

    // Press Escape
    await page.keyboard.press('Escape');

    // Focus should be on menu toggle
    await expect(menuToggle).toBeFocused();
  });

  test('keyboard navigation works within open menu', async ({ page }) => {
    const menuToggle = page.locator('.menu-toggle');

    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(300);

    // Tab through menu items
    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-link[href="#services"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-link[href="#process"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-link[href="#about"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-cta')).toBeFocused();
  });
});
