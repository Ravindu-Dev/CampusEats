import { test, expect } from '@playwright/test';

test.describe('Food Order Management', () => {

    test('should allow user to initiate checkout and enter order details', async ({ page }) => {
        // Mock Cart data in localStorage to simulate cart state
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991', email: 'test@student.com' }));
            localStorage.setItem('token', 'token-xx');
        });

        // Mock Cart API
        await page.route('**/api/cart', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, json: {
                    id: 'cart-123',
                    userId: 'US-991',
                    items: [
                        { menuItemId: 'item-1', name: 'Burger', price: 500, quantity: 2, canteenId: 'CAN-1', canteenName: 'Burger Joint' }
                    ]
                }});
            } else {
                await route.fulfill({ status: 200, json: [] });
            }
        });
        
        // Mock Loyalty to prevent hang if loyalty fetch fails
        await page.route('**/api/loyalty/account', async route => {
            await route.fulfill({ status: 200, json: { totalPoints: 0, tier: 'BRONZE' } });
        });

        // Mock Order Creation API
        await page.route('**/api/orders', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 200, json: [{ id: 'ORD-1', totalAmount: 1000 }] });
            } else {
                await route.fulfill({ status: 200, json: [] });
            }
        });

        // Mock payment intent API for Stripe
        await page.route('**/api/payment/create-intent', async route => {
            await route.fulfill({ status: 200, json: { clientSecret: 'pi_test_secret' } });
        });

        await page.goto('/checkout');
        
        // Assert Checkout UI components correctly render the cart data
        await expect(page.locator('h1').filter({ hasText: 'Checkout' })).toBeVisible();
        await expect(page.locator('h4', { hasText: 'Burger' })).toBeVisible();
        
        // Rs.1000.00 since it is 500x2
        await expect(page.locator('p:has-text("1000.00")').first()).toBeVisible();

        // Fill out Order Details form
        await page.fill('input[name="customerName"]', 'Test Student');
        await page.fill('input[name="customerEmail"]', 'test@student.com');
        await page.fill('input[name="customerPhone"]', '0712345678');
        await page.fill('input[name="pickupDate"]', '2029-01-01');
        await page.fill('input[name="pickupTime"]', '14:00');

        // Click to proceed to payment which creates the order
        const proceedButton = page.locator('button:has-text("Proceed to Payment")');
        await proceedButton.click();

        // Assert that the Stripe Payment box appears
        await expect(page.locator('h2:has-text("Payment Details")')).toBeVisible();
    });

    test('should display placed orders with QR code in user profile orders tab', async ({ page }) => {
        // Mock a logged-in user session
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-100', email: 'student@example.com' }));
            localStorage.setItem('token', 'fake-jwt-token');
        });

        // Mock user orders API - orderService.getUserOrders hits `/orders`
        await page.route('**/api/orders', async route => {
            await route.fulfill({
                status: 200,
                json: [{
                    id: 'ORD-MOCK-7721',
                    canteenId: 'CAN-1',
                    canteenName: 'Maha Oya Canteen',
                    orderStatus: 'PREPARING',
                    paymentStatus: 'succeeded',
                    totalAmount: 850,
                    qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 
                    orderItems: [{ name: 'Chicken Fried Rice', quantity: 1, price: 850, canteenName: 'Maha Oya Canteen' }],
                    createdAt: new Date().toISOString()
                }]
            });
        });

        await page.goto('/orders');

        // Check if the order is listed
        await expect(page.locator('text=ORD-MOCK-7721').first()).toBeVisible();
        await expect(page.locator('text=Chicken Fried Rice').first()).toBeVisible();
        await expect(page.locator('text=850.00').first()).toBeVisible();

        // Check for specific UI elements unique to the User Orders display (e.g., QR Code container)
        await expect(page.locator('h4:has-text("Your Pickup QR Code")')).toBeVisible();
        await expect(page.locator('img[alt="QR Code for order ORD-MOCK-7721"]')).toBeVisible();
    });

    test('should display order details in canteen dashboard order tab', async ({ page }) => {
        // Mock canteen login
        await page.addInitScript(() => {
            localStorage.setItem('canteenOwner', JSON.stringify({ id: 'O-123', ownerName: 'Admin', canteenId: 'CAN-1', token: 'fake-jwt' }));
        });

        // Mock canteen orders API using exact matching route
        await page.route('**/api/orders/canteen/CAN-1*', async route => {
            await route.fulfill({
                status: 200,
                json: [{
                    id: 'ORD-MOCK-7721',
                    customerName: 'Test Student',
                    customerEmail: 'test@student.com',
                    customerPhone: '0712345678',
                    orderStatus: 'PREPARING',
                    paymentStatus: 'succeeded',
                    totalAmount: 850,
                    orderType: 'NOW',
                    orderItems: [{ name: 'Chicken Fried Rice', quantity: 1, price: 850 }],
                    createdAt: new Date().toISOString()
                }]
            });
        });

        await page.route('**/api/canteens/owner*', async route => {
            await route.fulfill({
               status: 200,
               json: { id: 'CAN-1', canteenName: 'Test Canteen' } 
            });
        });

        await page.goto('/canteen/orders');
        
        // Assert the order shows up on the Canteen Management Side
        await expect(page.locator('text="Incoming Orders"')).toBeVisible();
        
        // Order # is sliced to last 6 chars: K-7721 from ORD-MOCK-7721
        await expect(page.locator('text=K-7721')).toBeVisible();
        await expect(page.locator('text=Chicken Fried Rice')).toBeVisible();
        
        // Assert that the Kitchen status badge applies -> it uses paymentStatus styles ('SUCCEEDED') and order type 'ORDER NOW'
        await expect(page.locator('text=SUCCEEDED').first()).toBeVisible();
        await expect(page.locator('text=ORDER NOW').first()).toBeVisible();
    });

});
