import { test, expect } from '@playwright/test';

test.describe('Unique Features: QR Generation and Scanning', () => {

    test('should generate and display a QR code for easy pickup of successful orders', async ({ page }) => {
        // Setup authenticated student user
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({ id: 'US-991' }));
            localStorage.setItem('token', 'token-xx');
        });

        await page.route('**/api/orders', async route => {
            await route.fulfill({
                status: 200, 
                json: [{
                    id: 'ORD-SC-B110',
                    canteenName: 'IT Cafe',
                    orderStatus: 'READY',
                    paymentStatus: 'succeeded',
                    // Faux B64 string triggering the rendering
                    qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWAQMAAAAGz+OhAAAABlBMVEX///8AAABVwtN+AAAAI0lEQVRIx2OYN4EBw4DBYBAzEB1g8BjB4DGCwWMEg8cIBo8BADfRAX7EOfj0AAAAAElFTkSuQmCC',
                    orderItems: [{ name: 'Espresso', quantity: 1, price: 300 }]
                }]
            });
        });

        await page.goto('/orders');

        // Target UI Block 
        await expect(page.locator('h4:has-text("Your Pickup QR Code")')).toBeVisible();
        
        // Assert Visual Element
        const qrcodeImg = page.locator('img[alt="QR Code for order ORD-SC-B110"]');
        await expect(qrcodeImg).toBeVisible();

        // Verify actionable trigger
        await expect(page.locator('button:has-text("Download QR Code")')).toBeVisible();
    });

    test('should allow canteen staff to scan or manually verify order QR codes to confirm handoff', async ({ page }) => {
        // Setup authenticated Canteen Owner
        await page.addInitScript(() => {
            localStorage.setItem('canteenOwner', JSON.stringify({ id: 'O-123', ownerName: 'Admin', canteenId: 'CAN-1', token: 'fake-jwt' }));
        });

        // Mock verification endpoint
        await page.route('**/api/orders/verify-qr*', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'ORD-SC-B110',
                    customerName: 'Test Student',
                    customerPhone: '0712345678',
                    orderStatus: 'READY',
                    totalAmount: 300,
                    paymentStatus: 'SUCCEEDED',
                    orderItems: [{ name: 'Espresso', quantity: 1, price: 300 }]
                }
            });
        });

        // Mock status update endpoint (CONFIRM HANDOFF)
        await page.route('**/api/orders/ORD-SC-B110/status*', async route => {
            if (route.request().method() === 'PATCH') {
                await route.fulfill({ status: 200, json: { message: 'Success' } });
            } else {
                await route.fulfill({ status: 200 });
            }
        });

        // Mock Canteen Orders page redirect
        await page.route('**/api/orders/canteen/CAN-1*', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/canteen/scan-qr');

        // Target UI Block 
        await expect(page.locator('h2:has-text("Manual Entry")')).toBeVisible();

        // Simulate manual entry as a fallback to scanning the physical QR
        await page.fill('input#orderId', 'ORD-SC-B110');
        await page.click('button:has-text("Verify Order")');

        // Wait for the modal popup verification to appear
        await expect(page.locator('h2:has-text("Order Verified")')).toBeVisible();
        await expect(page.locator('p:has-text("Test Student")')).toBeVisible();
        await expect(page.locator('p:has-text("Espresso")')).toBeVisible();
        
        // Assert the presence of Confirm Handoff button specifically
        const confirmButton = page.locator('button:has-text("Confirm Handoff")');
        await expect(confirmButton).toBeVisible();
        
        // Click and complete the handoff lifecycle
        await confirmButton.click();

        // Should route back to /canteen/orders with a subtle success notification toast / alert 
        await expect(page).toHaveURL(/\/canteen\/orders/);
        await expect(page.locator('text=handed off successfully')).toBeVisible();
    });

});
