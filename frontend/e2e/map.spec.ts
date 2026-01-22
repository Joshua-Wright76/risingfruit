import { fastTest, expect } from './fixtures/test-fixtures';

// All tests use fastTest since API data loading is unreliable in CI environments
fastTest.describe('Map Loading and Display', () => {
  fastTest('should load the map correctly', async ({ mapPage }) => {
    // Map canvas should be visible
    await expect(mapPage.mapCanvas).toBeVisible();

    // Map container should have proper dimensions
    const box = await mapPage.mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
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
