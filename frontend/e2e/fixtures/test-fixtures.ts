import { test as base, expect, type Page, type Locator } from '@playwright/test';

/**
 * Custom fixtures for Rising Fruit E2E tests
 */

// Page object for the map
export class MapPage {
  readonly page: Page;
  readonly mapContainer: Locator;
  readonly mapCanvas: Locator;
  readonly searchInput: Locator;
  readonly filterPanel: Locator;
  readonly locationSheet: Locator;
  readonly loadingIndicator: Locator;
  readonly locationCount: Locator;
  readonly geolocateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapContainer = page.locator('.mapboxgl-map');
    this.mapCanvas = page.locator('.mapboxgl-canvas');
    this.searchInput = page.locator('input[placeholder*="Search plants"]');
    this.filterPanel = page.locator('[data-testid="filter-panel"]');
    this.locationSheet = page.locator('[data-testid="location-sheet"]');
    this.loadingIndicator = page.locator('text=Loading...');
    this.locationCount = page.locator('text=/\\d+ locations/');
    this.geolocateButton = page.locator('[data-testid="geolocate-button"]');
  }

  async goto() {
    await this.page.goto('/app');
  }

  async waitForMapLoad() {
    // Wait for the map canvas to be visible
    await this.mapCanvas.waitFor({ state: 'visible', timeout: 30000 });
    // Wait for map to be interactive (loaded) - canvas has dimensions
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('.mapboxgl-canvas');
      return canvas && canvas.clientHeight > 0 && canvas.clientWidth > 0;
    }, undefined, { timeout: 30000 });
    // Wait for the loading skeleton to disappear (indicates React state mapLoaded=true)
    await this.page.waitForFunction(() => {
      return !document.body.innerText.includes('INITIALIZING MAP...');
    }, undefined, { timeout: 45000 });
  }

  async waitForLocationsLoaded() {
    // Wait for location count to appear (handles comma-formatted numbers like "1,234 locations")
    await this.page.waitForFunction(() => {
      const text = document.body.innerText;
      // Match numbers with optional commas followed by " locations"
      const countEl = text.match(/[\d,]+ locations/);
      return countEl !== null;
    }, undefined, { timeout: 45000 });
  }

  async clickOnMap(x: number, y: number) {
    await this.mapCanvas.click({ position: { x, y } });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for autocomplete dropdown to appear
    await expect(this.page.locator('[role="listbox"], [role="option"]').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Autocomplete may not always show results, that's okay
    });
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getLocationCount(): Promise<number> {
    const text = await this.locationCount.textContent();
    const match = text?.match(/([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  async waitForMapIdle() {
    // Wait for map to finish rendering/animating
    await this.page.waitForFunction(() => {
      // @ts-expect-error - accessing exposed map for testing
      const map = window.__risingfruit_map;
      return map && !map.isMoving() && !map.isZooming();
    }, undefined, { timeout: 10000 }).catch(() => {
      // Map may not expose these methods, continue anyway
    });
  }
}

// Full test fixture - waits for map AND locations (for tests that need data)
export const test = base.extend<{ mapPage: MapPage }>({
  mapPage: async ({ page }, use) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.waitForMapLoad();
    // Wait for locations to load before any test runs
    await mapPage.waitForLocationsLoaded();
    await use(mapPage);
  },
});

// Fast test fixture - only waits for map load (for UI-only tests)
export const fastTest = base.extend<{ mapPage: MapPage }>({
  mapPage: async ({ page }, use) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.waitForMapLoad();
    // Don't wait for locations - faster for UI-only tests
    await use(mapPage);
  },
});

export { expect };

