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

    test('should allow a user to successfully submit a 5-star review for a completed order', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991' }));
            localStorage.setItem('token', 'token-xx');
        });

        // Mock getting an order
        await page.route('**/api/orders', async route => {
            await route.fulfill({
                status: 200,
                json: [{ id: 'ORD-1', canteenName: 'Test Canteen', orderStatus: 'COMPLETED', paymentStatus: 'SUCCEEDED', hasReview: false, orderItems: [{ canteenId: 'CAN-1' }] }]
            });
        });

        // Mock POST review
        await page.route('**/api/reviews', async route => {
            await route.fulfill({ status: 200, json: { id: 'REV-1', message: 'Review created' } });
        });

        await page.goto('/orders');
        
        await page.click('button:has-text("Write a Review")');
        await expect(page.locator('h2:has-text("Write a Review")')).toBeVisible();

        // Click the 5th star
        await page.locator('form button').nth(4).click();
        
        await page.fill('textarea[placeholder*="Share your experience"]', 'Amazing food!');
        
        await page.click('button:has-text("Submit Review")');
        
        await expect(page.locator('text=Review submitted successfully!')).toBeVisible();
    });

    test('should prevent review submission if the star rating is missing', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991' }));
            localStorage.setItem('token', 'token-xx');
        });

        await page.route('**/api/orders', async route => {
            await route.fulfill({
                status: 200,
                json: [{ id: 'ORD-1', canteenName: 'Test Canteen', orderStatus: 'COMPLETED', paymentStatus: 'SUCCEEDED', hasReview: false, orderItems: [{ canteenId: 'CAN-1' }] }]
            });
        });

        await page.goto('/orders');
        
        await page.click('button:has-text("Write a Review")');
        
        // Don't click any stars, just type
        await page.fill('textarea[placeholder*="Share your experience"]', 'Forgot to rate');
        
        // The application disables the submit button if no rating is provided
        await expect(page.locator('button:has-text("Submit Review")')).toBeDisabled();
    });

    test('should render the user\'s past reviews in the Profile "My Reviews" tab', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991' }));
            localStorage.setItem('token', 'token-xx');
        });

        await page.route('**/api/reviews/user/US-991*', async route => {
            await route.fulfill({
                status: 200,
                json: [{ id: 'REV-99', rating: 4, comment: 'Great service', canteenName: 'Fast Food Canteen', createdAt: new Date().toISOString() }]
            });
        });
        
        // Also catch **/api/reviews/my if that's the endpoint
        await page.route('**/api/reviews/my*', async route => {
            await route.fulfill({
                status: 200,
                json: [{ id: 'REV-99', rating: 4, comment: 'Great service', canteenName: 'Fast Food Canteen', createdAt: new Date().toISOString() }]
            });
        });

        await page.goto('/my-reviews');
        
        await expect(page.locator('text=Great service')).toBeVisible();
        await expect(page.locator('text=Fast Food Canteen')).toBeVisible();
    });

    test('should show empty state graphic when viewing My Reviews if user has no past reviews', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991', name: 'Test Student' }));
            localStorage.setItem('token', 'fake-jwt');
        });

        // Mock zero reviews
        await page.route('**/api/reviews/my*', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/my-reviews');

        await expect(page.locator('h1:has-text("My Reviews")')).toBeVisible();
        await expect(page.locator('text=No reviews yet')).toBeVisible();
        await expect(page.locator('text=Complete an order and share your experience!')).toBeVisible();
    });
});
