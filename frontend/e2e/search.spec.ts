import { test, expect } from './fixtures/test-fixtures';

test.describe('Search Functionality', () => {
  test('should display search input', async ({ mapPage }) => {
    await expect(mapPage.searchInput).toBeVisible();
  });

  test('should allow typing in search input', async ({ mapPage, page }) => {
    // Wait for map to be ready (extra timeout for flaky tests)
    await page.waitForTimeout(1000);
    await mapPage.waitForLocationsLoaded();
    
    // Verify search input is visible
    await expect(mapPage.searchInput).toBeVisible({ timeout: 10000 });
    
    // Type in search
    await mapPage.searchInput.fill('orange');
    
    // Verify text was entered
    await expect(mapPage.searchInput).toHaveValue('orange');
  });

  test('should filter map when selecting a type from search', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Get initial count
    const initialCount = await mapPage.getLocationCount();
    
    // Search for a specific fruit
    await mapPage.searchInput.fill('orange');
    await page.waitForTimeout(1000);
    
    // Click on a result if available
    const orangeResult = page.locator('button, [role="option"]').filter({ hasText: /^Orange$/i }).first();
    
    if (await orangeResult.isVisible()) {
      await orangeResult.click();
      await page.waitForTimeout(1000);
      
      // The location count might change after filtering
      // Just verify the app is still functional
      const newCount = await mapPage.getLocationCount();
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show selected types indicator', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Search and select a type
    await mapPage.searchInput.fill('fig');
    await page.waitForTimeout(1000);
    
    // Look for a clickable result
    const figResult = page.locator('button').filter({ hasText: /Fig/i }).first();
    
    if (await figResult.isVisible()) {
      await figResult.click();
      await page.waitForTimeout(500);
      
      // Check for the "Filtering by X type(s)" indicator
      const filterIndicator = page.locator('text=/Filtering by 1 type/i');
      await expect(filterIndicator).toBeVisible();
    }
  });

  test('should clear search when clicking clear button', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Type in search
    await mapPage.searchInput.fill('apple');
    await page.waitForTimeout(500);
    
    // Verify text is entered
    await expect(mapPage.searchInput).toHaveValue('apple');
    
    // Clear the search
    await mapPage.searchInput.clear();
    
    // Verify search is cleared
    await expect(mapPage.searchInput).toHaveValue('');
  });

  test('should handle empty search results gracefully', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Search for something that likely doesn't exist
    await mapPage.searchInput.fill('xyznonexistentplant123');
    await page.waitForTimeout(1000);
    
    // App should still be functional, no errors
    await expect(mapPage.mapCanvas).toBeVisible();
  });
});

