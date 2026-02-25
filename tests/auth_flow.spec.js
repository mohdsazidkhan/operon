const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    test('should navigate to login page', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await expect(page).toHaveTitle(/Login/);
        await expect(page.locator('h1')).toContainText('Login');
    });

    test('should navigate to register page', async ({ page }) => {
        await page.goto('http://localhost:3000/register');
        await expect(page.locator('h1')).toContainText('Register');
    });

    test('should navigate to forgot password page', async ({ page }) => {
        await page.goto('http://localhost:3000/forgot-password');
        await expect(page.locator('h1')).toContainText('Forgot Password');
    });
});
