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
    const categoriesLabel = page.locator('text=Categories');
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
    const foragerButton = page.locator('button').filter({ hasText: 'Forager' });
    await foragerButton.click();
    await page.waitForTimeout(500);
    
    // Button should have active styling (bg-primary-600)
    await expect(foragerButton).toHaveClass(/bg-primary-600/);
    
    // Filter count badge should show
    const badge = page.locator('text=1').first();
    await expect(badge).toBeVisible();
  });

  test('should show season filter option', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('button').filter({ hasText: 'Filters' });
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Check for season filter section header
    const seasonLabel = page.locator('p.text-xs').filter({ hasText: 'Season' });
    await expect(seasonLabel).toBeVisible();
    
    const inSeasonButton = page.locator('button').filter({ hasText: 'In season now' });
    await expect(inSeasonButton).toBeVisible();
  });

  test('should toggle season filter when clicking', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Click season filter
    const inSeasonButton = page.locator('button').filter({ hasText: 'In season now' });
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Button should have active styling (bg-accent-600)
    await expect(inSeasonButton).toHaveClass(/bg-accent-600/);
  });

  test('should show clear all filters button when filters are active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate a filter
    const foragerButton = page.locator('button').filter({ hasText: 'Forager' });
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
    const foragerButton = page.locator('button').filter({ hasText: 'Forager' });
    await foragerButton.click();
    
    const inSeasonButton = page.locator('button').filter({ hasText: 'In season now' });
    await inSeasonButton.click();
    await page.waitForTimeout(500);
    
    // Click clear all
    const clearButton = page.locator('text=Clear all filters');
    await clearButton.click();
    await page.waitForTimeout(500);
    
    // Buttons should no longer have active styling
    await expect(foragerButton).not.toHaveClass(/bg-primary-600/);
    await expect(inSeasonButton).not.toHaveClass(/bg-accent-600/);
    
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
    const categoriesLabel = page.locator('p.text-xs').filter({ hasText: 'Categories' });
    await expect(categoriesLabel).toBeVisible();
    
    // Collapse filters
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Categories should be hidden (using CSS max-h-0 opacity-0)
    const filterPanel = page.locator('[data-testid="filter-panel"]');
    const expandedContent = filterPanel.locator('.max-h-0');
    await expect(expandedContent).toBeAttached();
  });

  test('should show filter count badge when filters are active', async ({ mapPage, page }) => {
    await mapPage.waitForLocationsLoaded();
    
    // Expand filters
    const filterToggle = page.locator('text=Filters');
    await filterToggle.click();
    await page.waitForTimeout(500);
    
    // Activate two filters
    const foragerButton = page.locator('button').filter({ hasText: 'Forager' });
    await foragerButton.click();
    
    const honeybeeButton = page.locator('button').filter({ hasText: 'Honeybee' });
    await honeybeeButton.click();
    await page.waitForTimeout(500);
    
    // Badge should show 2
    const badge = page.locator('.bg-primary-500').filter({ hasText: '2' });
    await expect(badge).toBeVisible();
  });
});

