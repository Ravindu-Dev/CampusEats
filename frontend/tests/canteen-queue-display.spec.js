import { test, expect } from '@playwright/test';

test.describe('Unique Features: Canteen Queue Display', () => {

    test('should display visual status badges describing queue loads on the public menu for varying canteens', async ({ page }) => {
        // 1. Map API configuration for Menu Items to empty array
        await page.route('**/api/menu-items*', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/combo-deals*', async route => {
             await route.fulfill({ status: 200, json: [] });
        });

        // 2. Mock The Active Canteens Base Request (intercepts Bulk load for canteens state)
        await page.route('**/api/canteens', async route => {
            await route.fulfill({
                status: 200, 
                json: [
                    { id: 'CAN-HIGH', canteenName: 'Burger Joint', status: 'APPROVED', active: true },
                    { id: 'CAN-MED', canteenName: 'Vegan Wrap Cart', status: 'APPROVED', active: true },
                    { id: 'CAN-LOW', canteenName: 'Coffee Express', status: 'APPROVED', active: true }
                ]
            });
        });

        // 3. IMPORTANT: Mock the Queue Status API for the dynamic badge feature
        await page.route('**/api/canteens/queue-status*', async route => {
            await route.fulfill({
                status: 200, 
                json: [
                    { canteenId: 'CAN-HIGH', queueStatus: 'HIGH' },
                    { canteenId: 'CAN-MED', queueStatus: 'MEDIUM' },
                    { canteenId: 'CAN-LOW', queueStatus: 'LOW' }
                ]
            });
        });

        // Navigate to public menu page
        await page.goto('/menu');

        // Filter the UI list by scrolling or wait for render
        await expect(page.locator('h2:has-text("Browse by Restaurant")')).toBeVisible();

        // High Queue Validation (bg-red-500)
        const highQueueLocator = page.locator('.bg-red-500', { hasText: 'High Queue' });
        await expect(highQueueLocator).toBeVisible();
        await expect(highQueueLocator).toContainText('🔥');

        // Medium Queue Validation (bg-yellow-500)
        const mediumQueueLocator = page.locator('.bg-yellow-500', { hasText: 'Medium Queue' });
        await expect(mediumQueueLocator).toBeVisible();
        await expect(mediumQueueLocator).toContainText('⚡');

        // Low Queue Validation (bg-green-500)
        const lowQueueLocator = page.locator('.bg-green-500', { hasText: 'Low Queue' });
        await expect(lowQueueLocator).toBeVisible();
        await expect(lowQueueLocator).toContainText('✓');
    });

});
