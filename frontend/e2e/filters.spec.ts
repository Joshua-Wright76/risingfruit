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
    
    // Check that categories are visible
    const categoriesLabel = page.locator('[data-testid="categories-label"]');
    await expect(categoriesLabel).toBeVisible();
    
    // Check for category buttons
    const foragerButton = page.locator('button').filter({ hasText: 'Forager' });
    await expect(foragerButton).toBeVisible();
  });

  test('should toggle category filter when clicking category button', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Click Forager category
    const foragerButton = page.locator('[data-testid="category-forager"]');
    await foragerButton.click();
    await page.waitForTimeout(500);
    
    // Button should have active state
    await expect(foragerButton).toHaveAttribute('data-active', 'true');
    
    // Filter count badge should show
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
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
  });

  test('should show clear all filters button when filters are active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate a filter
    const foragerButton = page.locator('[data-testid="category-forager"]');
    await foragerButton.click();
    await page.waitForTimeout(500);
    
    // Check for clear button
    const clearButton = page.locator('text=Clear all filters');
    await expect(clearButton).toBeVisible();
  });

  test('should clear all filters when clicking clear button', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate multiple filters
    const foragerButton = page.locator('[data-testid="category-forager"]');
    await foragerButton.click();
    
    const inSeasonButton = page.locator('[data-testid="season-filter"]');
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Click clear all
    const clearButton = page.locator('text=Clear all filters');
    await clearButton.click();
    await page.waitForTimeout(500);
    
    // Buttons should no longer have active state
    await expect(foragerButton).toHaveAttribute('data-active', 'false');
    await expect(inSeasonButton).toHaveAttribute('data-active', 'false');
    
    // Clear button should be hidden
    await expect(clearButton).not.toBeVisible();
  });

  test('should collapse filter panel when clicking toggle again', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Verify expanded
    const categoriesLabel = page.locator('[data-testid="categories-label"]');
    await expect(categoriesLabel).toBeVisible();
    
    // Collapse filters
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Categories should be hidden
    await expect(categoriesLabel).not.toBeVisible();
  });

  test('should show filter count badge when filters are active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate two filters
    const foragerButton = page.locator('[data-testid="category-forager"]');
    await foragerButton.click();
    
    const honeybeeButton = page.locator('[data-testid="category-honeybee"]');
    await honeybeeButton.click();
    await page.waitForTimeout(500);
    
    // Badge should show 2
    const badge = page.locator('[data-testid="filter-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('2');
  });
});
