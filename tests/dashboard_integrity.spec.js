const { test, expect } = require('@playwright/test');

test.describe('Dashboard Data Integrity', () => {
    test.beforeEach(async ({ page }) => {
        // In a real test, we would perform login here or use a saved state.
        // For now, we are testing accessibility and rendering of SSR components.
        await page.goto('http://localhost:3000/');
    });

    test('Overview dashboard should render correctly', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Architecture Overview');
        // Check if KPIs are rendered
        await expect(page.locator('p:has-text("Institutional Valuation")')).toBeVisible();
    });

    test('Sales dashboard should render correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/sales');
        await expect(page.locator('h1')).toContainText('Sales Intelligence');
        await expect(page.locator('h3:has-text("Pipeline Density")')).toBeVisible();
    });

    test('Finance dashboard should render correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/finance');
        await expect(page.locator('h1')).toContainText('Fiscal Matrix');
        await expect(page.locator('h3:has-text("P&L Variance")')).toBeVisible();
    });

    test('HR dashboard should render correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/hr');
        await expect(page.locator('h1')).toContainText('Workforce Intelligence');
        await expect(page.locator('h3:has-text("Sector Allocation")')).toBeVisible();
    });

    test('Operations dashboard should render correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/operations');
        await expect(page.locator('h1')).toContainText('Operations Logistics');
        await expect(page.locator('h3:has-text("Stock Saturation")')).toBeVisible();
    });
});
