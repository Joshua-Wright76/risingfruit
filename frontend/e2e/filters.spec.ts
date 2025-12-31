import { test, expect } from './fixtures/test-fixtures';

test.describe('Filter Panel', () => {
  test('should display filter toggle button', async ({ mapPage, page }) => {
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await expect(filterToggle).toBeVisible();
  });

  test('should expand filter panel when clicking toggle', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Click to expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Check that season section is visible
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();
    
    // Check for season filter button
    const seasonFilter = page.locator('[data-testid="season-filter"]');
    await expect(seasonFilter).toBeVisible();
  });

  test('should show season filter option', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Check for season filter section header
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();
    
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await expect(inSeasonButton).toBeVisible();
  });

  test('should toggle season filter when clicking', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Click season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Button should have active state
    await expect(inSeasonButton).toHaveAttribute('data-active', 'true');
    
    // Filter count badge should show
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });

  test('should show reset filters button when filters are active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Check for reset button
    const resetButton = page.locator('text=Reset Filters');
    await expect(resetButton).toBeVisible();
  });

  test('should clear all filters when clicking reset button', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Click reset
    const resetButton = page.locator('text=Reset Filters');
    await resetButton.click();
    await page.waitForTimeout(500);
    
    // Button should no longer have active state
    await expect(inSeasonButton).toHaveAttribute('data-active', 'false');
    
    // Reset button should be hidden
    await expect(resetButton).not.toBeVisible();
  });

  test('should collapse filter panel when clicking toggle again', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Verify expanded
    const seasonLabel = page.locator('[data-testid="season-label"]');
    await expect(seasonLabel).toBeVisible();
    
    // Collapse filters
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Season section should be hidden
    await expect(seasonLabel).not.toBeVisible();
  });

  test('should show filter count badge when season filter is active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate season filter
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Badge should show 1
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });
});
