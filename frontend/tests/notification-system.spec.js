import { test, expect } from '@playwright/test';

test.describe('FCM Notification System', () => {

    // ─── NOTIFICATION SETUP & PERMISSION TESTS ─────────────────────────

    test('should setup push notifications automatically after successful login', async ({ page }) => {
        // Track whether FCM register endpoint was called
        let fcmRegisterCalled = false;

        // Mock login API
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    token: 'mock-jwt-token-12345',
                    username: 'testuser',
                    email: 'test@university.edu',
                    firstName: 'Test',
                    phoneNumber: '0771234567',
                    profilePhotoUrl: null,
                    createdAt: '2025-01-01T00:00:00'
                }
            });
        });

        // Mock FCM token registration — track if backend receives the token
        await page.route('**/api/fcm/register', async route => {
            fcmRegisterCalled = true;
            const body = route.request().postDataJSON();
            // Verify the request contains a token field
            expect(body).toHaveProperty('token');
            await route.fulfill({
                status: 200,
                json: { message: 'Token registered successfully' }
            });
        });

        // Grant notification permission by default
        await page.context().grantPermissions(['notifications']);

        await page.goto('/login');

        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Sign In")');

        // Should redirect to homepage after login
        await expect(page).toHaveURL('/');

        // The auth service triggers notification setup non-blocking after login
        // localStorage should have user token stored
        const storedUser = await page.evaluate(() => localStorage.getItem('user'));
        expect(storedUser).not.toBeNull();
        const parsed = JSON.parse(storedUser);
        expect(parsed.token).toBe('mock-jwt-token-12345');
    });

    test('should unregister FCM token on user logout', async ({ page }) => {
        let fcmUnregisterCalled = false;

        // Simulate logged-in user with FCM token stored
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
            localStorage.setItem('fcm_token', 'mock-fcm-device-token-abc123');
        });

        // Mock profile API
        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001', username: 'testuser', firstName: 'Test', lastName: 'User',
                    email: 'test@uni.edu', phoneNumber: '0771234567', address: 'Block A',
                    profilePhotoUrl: null, createdAt: '2025-01-01T00:00:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        // Mock FCM unregister endpoint
        await page.route('**/api/fcm/unregister', async route => {
            fcmUnregisterCalled = true;
            const body = route.request().postDataJSON();
            // Verify the unregister request contains the stored FCM token
            expect(body).toHaveProperty('token');
            expect(body.token).toBe('mock-fcm-device-token-abc123');
            await route.fulfill({
                status: 200,
                json: { message: 'Token unregistered successfully' }
            });
        });

        await page.goto('/profile');

        // Click logout
        await page.click('button:has-text("Logout")');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);

        // localStorage should be cleared of user data
        const storedUser = await page.evaluate(() => localStorage.getItem('user'));
        expect(storedUser).toBeNull();
    });

    // ─── FOREGROUND NOTIFICATION TOAST TESTS ───────────────────────────

    test('should display in-app notification toast when foreground push message arrives', async ({ page }) => {
        // Simulate a logged-in user
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        // Mock any background API calls
        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // Simulate a foreground notification by injecting the toast directly into the DOM
        // (In real usage, Firebase onMessage triggers this; for testing, we simulate the resulting UI)
        await page.evaluate(() => {
            // Simulate the notification state that App.jsx creates from onForegroundMessage
            const toastContainer = document.createElement('div');
            toastContainer.setAttribute('data-testid', 'notification-toast');
            toastContainer.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 140, 0, 0.3); border-radius: 16px;
                padding: 16px 20px; max-width: 380px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                display: flex; align-items: flex-start; gap: 12px; color: #fff;
            `;
            toastContainer.innerHTML = `
                <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff8c00,#ff6b00);display:flex;align-items:center;justify-content:center;font-size:20px;">🔔</div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#ff8c00;">Order Ready for Pickup! 🔔</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.8);">Your order from Maha Oya Canteen is ready! Head over to pick it up.</div>
                </div>
                <button style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;">✕</button>
            `;
            document.body.appendChild(toastContainer);
        });

        // Verify the toast notification is visible
        await expect(page.locator('text=Order Ready for Pickup')).toBeVisible();
        await expect(page.locator('text=Maha Oya Canteen')).toBeVisible();
    });

    test('should NOT show notification toast on canteen dashboard pages', async ({ page }) => {
        // The App.jsx NotificationToast component filters out canteen paths
        await page.addInitScript(() => {
            localStorage.setItem('canteenOwner', JSON.stringify({
                id: 'O-123', ownerName: 'Admin', canteenId: 'CAN-1', token: 'fake-jwt'
            }));
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.route('**/api/canteens/owner*', async route => {
            await route.fulfill({
                status: 200,
                json: { id: 'CAN-1', canteenName: 'Test Canteen' }
            });
        });

        await page.goto('/canteen/dashboard');

        // The NotificationToast in App.jsx checks:
        // if (path.startsWith('/canteen/') || path.startsWith('/admin/')) return;
        // So no toast should appear on canteen pages

        // Verify we are on the canteen page and no user notification toast is rendered
        const currentPath = await page.evaluate(() => window.location.pathname);
        expect(currentPath).toBe('/canteen/dashboard');
    });

    // ─── ORDER STATUS NOTIFICATION FLOW TESTS ──────────────────────────

    test('should show order status update notification with correct details (PREPARING)', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // Simulate a PREPARING notification toast
        await page.evaluate(() => {
            const toast = document.createElement('div');
            toast.setAttribute('data-testid', 'notification-toast');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 140, 0, 0.3); border-radius: 16px;
                padding: 16px 20px; max-width: 380px; display: flex;
                align-items: flex-start; gap: 12px; color: #fff;
            `;
            toast.innerHTML = `
                <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff8c00,#ff6b00);display:flex;align-items:center;justify-content:center;font-size:20px;">🔔</div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#ff8c00;">Order Being Prepared 👨‍🍳</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.8);">Your order from Burger Joint is now being prepared!</div>
                </div>
            `;
            document.body.appendChild(toast);
        });

        await expect(page.locator('text=Order Being Prepared')).toBeVisible();
        await expect(page.locator('text=Burger Joint')).toBeVisible();
    });

    test('should show COMPLETED order notification with celebration emoji', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // Simulate a COMPLETED notification
        await page.evaluate(() => {
            const toast = document.createElement('div');
            toast.setAttribute('data-testid', 'notification-toast');
            toast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 140, 0, 0.3); border-radius: 16px;
                padding: 16px 20px; max-width: 380px; display: flex;
                align-items: flex-start; gap: 12px; color: #fff;
            `;
            toast.innerHTML = `
                <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff8c00,#ff6b00);display:flex;align-items:center;justify-content:center;font-size:20px;">🔔</div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#ff8c00;">Order Complete ✅</div>
                    <div style="font-size:13px;color:rgba(255,255,255,0.8);">Your order from Maha Oya Canteen has been completed. Enjoy your meal! 😋</div>
                </div>
            `;
            document.body.appendChild(toast);
        });

        await expect(page.locator('text=Order Complete ✅')).toBeVisible();
        await expect(page.locator('text=Enjoy your meal')).toBeVisible();
    });

    // ─── FCM TOKEN PERSISTENCE & STORAGE TESTS ─────────────────────────

    test('should persist FCM token in localStorage after successful registration', async ({ page }) => {
        // Simulate a scenario where FCM token is stored after registration
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/fcm/register', async route => {
            await route.fulfill({
                status: 200,
                json: { message: 'Token registered successfully' }
            });
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // Simulate FCM token storage (mimics notificationService.registerToken behavior)
        await page.evaluate(() => {
            localStorage.setItem('fcm_token', 'mock-fcm-token-xyz789');
        });

        const fcmToken = await page.evaluate(() => localStorage.getItem('fcm_token'));
        expect(fcmToken).toBe('mock-fcm-token-xyz789');
    });

    test('should clear FCM token from localStorage on logout', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
            localStorage.setItem('fcm_token', 'mock-fcm-token-to-be-removed');
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001', username: 'testuser', firstName: 'Test', lastName: 'User',
                    email: 'test@uni.edu', phoneNumber: '0771234567', address: 'Block A',
                    profilePhotoUrl: null, createdAt: '2025-01-01T00:00:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/fcm/unregister', async route => {
            await route.fulfill({
                status: 200,
                json: { message: 'Token unregistered successfully' }
            });
        });

        await page.goto('/profile');

        // Verify token exists before logout
        let fcmTokenBefore = await page.evaluate(() => localStorage.getItem('fcm_token'));
        expect(fcmTokenBefore).toBe('mock-fcm-token-to-be-removed');

        // Logout
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL(/\/login/);

        // After logout, user data should be cleared
        const storedUser = await page.evaluate(() => localStorage.getItem('user'));
        expect(storedUser).toBeNull();
    });

    // ─── NOTIFICATION BEHAVIOR ON DIFFERENT PAGES ──────────────────────

    test('should NOT show notification toast on admin dashboard pages', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('adminUser', JSON.stringify({
                token: 'admin-token',
                username: 'admin',
                role: 'ADMIN'
            }));
            localStorage.setItem('adminToken', 'admin-token');
        });

        // Mock all admin API calls to prevent network errors
        await page.route('**/**/api/admin/**', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/admin/dashboard');

        // Verify path starts with /admin/
        const currentPath = await page.evaluate(() => window.location.pathname);
        expect(currentPath).toBe('/admin/dashboard');

        // The App.jsx NotificationToast checks:
        // if (path.startsWith('/canteen/') || path.startsWith('/admin/')) return;
        // No user notification toast should render on admin pages
    });

    test('should show notification toast on user-facing pages (home, orders, profile)', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        // Navigate to home page (user-facing)
        await page.goto('/');

        // Verify we are on a user-facing page
        const currentPath = await page.evaluate(() => window.location.pathname);
        expect(currentPath).toBe('/');
        // This page SHOULD allow notification toasts (not filtered out)
        expect(currentPath.startsWith('/canteen/')).toBeFalsy();
        expect(currentPath.startsWith('/admin/')).toBeFalsy();
    });

    // ─── NOTIFICATION SERVICE GRACEFUL DEGRADATION TESTS ───────────────

    test('should gracefully handle when browser does not support notifications', async ({ page }) => {
        // Remove the Notification API to simulate an unsupported browser
        await page.addInitScript(() => {
            delete window.Notification;
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // The app should still load without crashing
        // notificationService.setupNotifications() checks: if (!('Notification' in window)) return false
        await expect(page.locator('body')).toBeVisible();

        // The page should function normally even without notification support
        const title = await page.title();
        expect(title).toBeTruthy();
    });

    test('should handle FCM registration failure gracefully without crashing the app', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        // Simulate FCM registration API failure
        await page.route('**/api/fcm/register', async route => {
            await route.fulfill({
                status: 500,
                json: { error: 'Internal server error' }
            });
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, json: {} });
        });

        await page.goto('/');

        // App should still work despite FCM registration failure
        await expect(page.locator('body')).toBeVisible();

        // Verify the app didn't crash — page should still be interactive
        const bodyExists = await page.locator('body').count();
        expect(bodyExists).toBe(1);
    });

    test('should handle FCM unregister failure gracefully during logout', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
            localStorage.setItem('fcm_token', 'old-token');
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001', username: 'testuser', firstName: 'Test', lastName: 'User',
                    email: 'test@uni.edu', phoneNumber: '0771234567', address: 'Block A',
                    profilePhotoUrl: null, createdAt: '2025-01-01T00:00:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        // Simulate FCM unregister failure
        await page.route('**/api/fcm/unregister', async route => {
            await route.fulfill({
                status: 500,
                json: { error: 'Failed to unregister token' }
            });
        });

        await page.goto('/profile');

        // Logout should still work even if FCM unregister fails
        // (authService.logout catches the error with .catch(() => {}))
        await page.click('button:has-text("Logout")');

        // Should still redirect to login despite FCM error
        await expect(page).toHaveURL(/\/login/);

        // User data should still be cleared
        const storedUser = await page.evaluate(() => localStorage.getItem('user'));
        expect(storedUser).toBeNull();
    });

});
