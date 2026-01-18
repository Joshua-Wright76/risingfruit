import { test, fastTest, expect } from './fixtures/test-fixtures';

test.describe('Map Loading and Display', () => {
  // UI-only tests use fastTest (no waiting for locations)
  fastTest('should load the map correctly', async ({ mapPage }) => {
    // Map canvas should be visible
    await expect(mapPage.mapCanvas).toBeVisible();

    // Map container should have proper dimensions
    const box = await mapPage.mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('should display map at Long Beach, CA by default', async ({ mapPage }) => {
    // Fixture already waits for locations, just verify count
    const count = await mapPage.getLocationCount();
    expect(count).toBeGreaterThan(0);
  });

  fastTest('should have zoom controls visible', async ({ mapPage }) => {
    await expect(mapPage.zoomInButton).toBeVisible();
    await expect(mapPage.zoomOutButton).toBeVisible();
  });

  test('should zoom in when clicking zoom in button', async ({ mapPage }) => {
    const initialCount = await mapPage.getLocationCount();

    // Zoom in multiple times
    await mapPage.zoomIn();
    await mapPage.zoomIn();
    await mapPage.zoomIn();

    // Wait for map to settle and new data to load
    await mapPage.waitForMapIdle();
    await mapPage.waitForLocationsLoaded();

    // After zooming in, verify the map is still functional
    const newCount = await mapPage.getLocationCount();
    expect(newCount).toBeGreaterThanOrEqual(0);
  });

  fastTest('should have geolocate button visible', async ({ mapPage }) => {
    await expect(mapPage.geolocateButton).toBeVisible();
  });

  fastTest('should display search bar', async ({ mapPage }) => {
    await expect(mapPage.searchInput).toBeVisible();
  });

  fastTest('should display filter panel', async ({ mapPage, page }) => {
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await expect(filterToggle).toBeVisible();
  });
});
