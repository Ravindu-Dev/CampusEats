import { test, expect } from '@playwright/test';

test.describe('Review Management System', () => {
    test('should fetch community reviews, show pagination, and support text/rating filtering', async ({ page }) => {
        await page.route('**/api/reviews*', async route => {
            await route.fulfill({
                status: 200,
                json: [
                    {
                        id: 'REV-001',
                        userName: 'Kasun P.',
                        canteenName: 'Lodge Canteen',
                        rating: 5,
                        comment: 'Absolutely phenomenal food quality and fast service.',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'REV-002',
                        userName: 'Nimali W.',
                        canteenName: 'Student Hub',
                        rating: 3,
                        comment: 'Okay, but food could be significantly warmer.',
                        createdAt: new Date().toISOString()
                    }
                ]
            });
        });

        await page.goto('/reviews');

        // Verify Hero layout
        await expect(page.locator('h1:has-text("Community Reviews")')).toBeVisible();

        // Verify Data Loaded (Both reviews present)
        await expect(page.locator('text=Absolutely phenomenal food quality')).toBeVisible();
        await expect(page.locator('text=Okay, but food could be significantly warmer.')).toBeVisible();
        await expect(page.locator('text=of 2 reviews')).toBeVisible();

        // **Test Action: Search Filter**
        await page.fill('input[placeholder="Search by canteen, user, or comment..."]', 'Student');
        
        // Results should instantly reflect search
        await expect(page.locator('text=Student Hub')).toBeVisible();
        await expect(page.locator('text=Lodge Canteen')).not.toBeVisible();
        await expect(page.locator('text=of 1 reviews')).toBeVisible();

        // Clear Search
        await page.fill('input[placeholder="Search by canteen, user, or comment..."]', '');

        // **Test Action: Rating Filter**
        await page.selectOption('select', { label: '⭐⭐⭐⭐⭐ 5 Stars' });
        
        // Verified Filtered state
        await expect(page.locator('text=Absolutely phenomenal food quality')).toBeVisible();
        await expect(page.locator('text=Okay, but food could be significantly warmer.')).not.toBeVisible();
    });
});
