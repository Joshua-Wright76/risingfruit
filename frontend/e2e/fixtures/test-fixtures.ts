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
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
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
    this.zoomInButton = page.locator('.mapboxgl-ctrl-zoom-in');
    this.zoomOutButton = page.locator('.mapboxgl-ctrl-zoom-out');
    this.geolocateButton = page.locator('.mapboxgl-ctrl-geolocate');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForMapLoad() {
    // Wait for the map canvas to be visible
    await this.mapCanvas.waitFor({ state: 'visible', timeout: 30000 });
    // Wait for map to be interactive (loaded)
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('.mapboxgl-canvas');
      return canvas && canvas.clientHeight > 0 && canvas.clientWidth > 0;
    }, { timeout: 30000 });
  }

  async waitForLocationsLoaded() {
    // Wait for location count or markers to appear
    await this.page.waitForFunction(() => {
      const countEl = document.body.innerText.match(/\d+ locations/);
      return countEl !== null;
    }, { timeout: 30000 });
  }

  async clickOnMap(x: number, y: number) {
    await this.mapCanvas.click({ position: { x, y } });
  }

  async zoomIn() {
    await this.zoomInButton.click();
    // Wait for zoom animation
    await this.page.waitForTimeout(500);
  }

  async zoomOut() {
    await this.zoomOutButton.click();
    // Wait for zoom animation
    await this.page.waitForTimeout(500);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for autocomplete results
    await this.page.waitForTimeout(500);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getLocationCount(): Promise<number> {
    const text = await this.locationCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

// Extend the base test with our fixtures
export const test = base.extend<{ mapPage: MapPage }>({
  mapPage: async ({ page }, use) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.waitForMapLoad();
    await use(mapPage);
  },
});

export { expect };

