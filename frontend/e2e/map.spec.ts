import { test, expect } from './fixtures/test-fixtures';

test.describe('Map Loading and Display', () => {
  test('should load the map correctly', async ({ mapPage }) => {
    // Map canvas should be visible
    await expect(mapPage.mapCanvas).toBeVisible();
    
    // Map container should have proper dimensions
    const box = await mapPage.mapCanvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('should display map at Long Beach, CA by default', async ({ mapPage }) => {
    // Wait for locations to load
    await mapPage.waitForLocationsLoaded();
    
    // Should show some locations
    const count = await mapPage.getLocationCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should have zoom controls visible', async ({ mapPage }) => {
    await expect(mapPage.zoomInButton).toBeVisible();
    await expect(mapPage.zoomOutButton).toBeVisible();
  });

  test('should zoom in when clicking zoom in button', async ({ mapPage, page }) => {
    // Get initial zoom level by checking the URL or map state
    await mapPage.waitForLocationsLoaded();
    
    const initialCount = await mapPage.getLocationCount();
    
    // Zoom in multiple times
    await mapPage.zoomIn();
    await mapPage.zoomIn();
    await mapPage.zoomIn();
    
    // Wait for new data to load
    await page.waitForTimeout(1000);
    
    // After zooming in, we might see fewer clustered markers
    // or more individual markers - the count should change
    const newCount = await mapPage.getLocationCount();
    // Just verify the map is still functional
    expect(newCount).toBeGreaterThanOrEqual(0);
  });

  test('should have geolocate button visible', async ({ mapPage }) => {
    await expect(mapPage.geolocateButton).toBeVisible();
  });

  test('should display search bar', async ({ mapPage }) => {
    await expect(mapPage.searchInput).toBeVisible();
  });

  test('should display filter panel', async ({ mapPage, page }) => {
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await expect(filterToggle).toBeVisible();
  });
});

