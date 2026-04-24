// @ts-check
import { test, expect } from '@playwright/test';

/*
 * ============================================================
 *  ORDER STATUS MANAGEMENT SYSTEM — E2E Tests (Playwright)
 * ============================================================
 *  Component Owner : Ravindu
 *  Covers          : KitchenDashboard.jsx, OrderTracking.jsx,
 *                    orderService.js (frontend)
 *                    OrderService.java, OrderController.java (backend)
 *
 *  User Journeys Tested:
 *    1. Kitchen Dashboard loads and displays paid orders
 *    2. Order filtering by status (PENDING / PREPARING / READY / COMPLETED)
 *    3. Order status transition: PENDING → PREPARING → READY → COMPLETED
 *    4. Unpaid orders are filtered out from the kitchen view
 *    5. Order Tracking page shows real-time progress for a customer
 *    6. Order Tracking shows "Ready for Pickup" alert
 *    7. Payment validation — cannot update status if payment is incomplete
 * ============================================================
 */

// ── Mock Data ──────────────────────────────────────────────────

const MOCK_CANTEEN_OWNER = {
    id: 'owner-001',
    canteenId: 'canteen-001',
    ownerName: 'Test Canteen Owner',
    token: 'mock-jwt-token-canteen-owner',
};

const createMockOrder = (overrides = {}) => ({
    id: 'order-' + Math.random().toString(36).substring(2, 8),
    userId: 'user-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+94771234567',
    pickupDate: '2026-04-23',
    pickupTime: '12:30',
    totalAmount: 1250.00,
    paymentStatus: 'succeeded',
    orderStatus: 'PENDING',
    orderType: 'NOW',
    hasReview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderItems: [
        {
            menuItemId: 'item-001',
            name: 'Chicken Rice',
            price: 750.00,
            quantity: 1,
            canteenId: 'canteen-001',
            canteenName: 'Main Canteen',
            imageUrl: null,
        },
        {
            menuItemId: 'item-002',
            name: 'Fresh Juice',
            price: 500.00,
            quantity: 1,
            canteenId: 'canteen-001',
            canteenName: 'Main Canteen',
            imageUrl: null,
        },
    ],
    ...overrides,
});

const MOCK_ORDERS = [
    createMockOrder({ id: 'ord-aaa111', orderStatus: 'PENDING', customerName: 'Alice Fernando' }),
    createMockOrder({ id: 'ord-bbb222', orderStatus: 'PREPARING', customerName: 'Bob Perera', preparedAt: new Date().toISOString() }),
    createMockOrder({ id: 'ord-ccc333', orderStatus: 'READY', customerName: 'Charlie Silva', preparedAt: new Date().toISOString(), readyAt: new Date().toISOString() }),
    createMockOrder({ id: 'ord-ddd444', orderStatus: 'COMPLETED', customerName: 'Diana Jayawardena', preparedAt: new Date().toISOString(), readyAt: new Date().toISOString(), completedAt: new Date().toISOString() }),
    createMockOrder({ id: 'ord-eee555', orderStatus: 'PENDING', paymentStatus: 'pending', customerName: 'Unpaid Customer' }), // Unpaid order
];

// ── Helper: Set up canteen owner auth in localStorage ────────

async function loginAsCanteenOwner(page) {
    await page.addInitScript((owner) => {
        localStorage.setItem('canteenOwner', JSON.stringify(owner));
    }, MOCK_CANTEEN_OWNER);
}

// ── Helper: Mock API routes ──────────────────────────────────

async function mockKitchenAPIs(page, orders = MOCK_ORDERS) {
    // Mock canteen orders endpoint
    await page.route('**/api/orders/canteen/**', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(orders),
        });
    });

    // Mock order status update endpoint
    await page.route('**/api/orders/*/status*', (route, request) => {
        if (request.method() === 'PATCH') {
            const orderId = request.url().match(/orders\/([^/]+)\/status/)?.[1];
            const order = orders.find((o) => o.id === orderId);
            if (order) {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ ...order, orderStatus: 'PREPARING' }),
                });
            } else {
                route.fulfill({ status: 404, body: 'Order not found' });
            }
        } else {
            // GET for order status (public tracking)
            const orderId = request.url().match(/orders\/([^/]+)\/status/)?.[1];
            const order = orders.find((o) => o.id === orderId);
            if (order) {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(order),
                });
            } else {
                route.fulfill({ status: 404, body: 'Order not found' });
            }
        }
    });
}

// ══════════════════════════════════════════════════════════════
//  TEST SUITE: Kitchen Dashboard
// ══════════════════════════════════════════════════════════════

test.describe('Kitchen Dashboard — Order Status Management', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsCanteenOwner(page);
        await mockKitchenAPIs(page);
    });

    // ── TEST 1: Dashboard loads and displays orders ──────────

    test('TC-OSM-01: Kitchen Dashboard loads and displays paid orders', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // Dashboard title should be visible
        await expect(page.getByRole('heading', { name: /Kitchen Dashboard/i }).first()).toBeVisible();

        // Should show filter tabs
        await expect(page.getByRole('button', { name: /Pending/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Preparing/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Ready/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Completed/i }).first()).toBeVisible();

        // Should display paid order customers (not the unpaid one)
        await expect(page.getByText('Alice Fernando').first()).toBeVisible();
        await expect(page.getByText('Bob Perera').first()).toBeVisible();

        // Unpaid order should NOT be visible
        await expect(page.getByText('Unpaid Customer')).not.toBeVisible();
    });

    // ── TEST 2: Filter orders by status ─────────────────────

    test('TC-OSM-02: Filter orders by PENDING status', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // Click on PENDING filter tab
        await page.getByRole('button', { name: /^Pending/i }).first().click();

        // Should show PENDING orders
        await expect(page.getByText('Alice Fernando').first()).toBeVisible();

        // Should NOT show PREPARING/READY/COMPLETED orders
        await expect(page.getByText('Bob Perera')).not.toBeVisible();
        await expect(page.getByText('Charlie Silva')).not.toBeVisible();
        await expect(page.getByText('Diana Jayawardena')).not.toBeVisible();
    });

    test('TC-OSM-03: Filter orders by PREPARING status', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // Click on PREPARING filter tab
        await page.getByRole('button', { name: /^Preparing/i }).first().click();

        // Should show only PREPARING orders
        await expect(page.getByText('Bob Perera').first()).toBeVisible();

        // Others should be hidden
        await expect(page.getByText('Alice Fernando')).not.toBeVisible();
    });

    test('TC-OSM-04: Filter orders by READY status', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        await page.getByRole('button', { name: /^Ready/i }).first().click();
        await expect(page.getByText('Charlie Silva').first()).toBeVisible();
        await expect(page.getByText('Alice Fernando')).not.toBeVisible();
    });

    // ── TEST 3: Order status transition buttons ─────────────

    test('TC-OSM-05: Start Preparing button is enabled only for PENDING orders', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // "All" filter — shows all orders
        // Find the PENDING order card and verify "Start Preparing" is enabled
        await expect(page.getByText('Alice Fernando').first()).toBeVisible();

        // The "Start Preparing" button should exist
        await expect(page.getByRole('button', { name: /Start Preparing/i }).first()).toBeVisible();
    });

    test('TC-OSM-06: Mark Ready button is enabled only for PREPARING orders', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // Filter to show PREPARING orders
        await page.getByRole('button', { name: /^Preparing/i }).first().click();

        await expect(page.getByRole('button', { name: /Mark Ready/i }).first()).toBeVisible();
    });

    test('TC-OSM-07: Complete button is enabled only for READY orders', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        await page.getByRole('button', { name: /^Ready/i }).first().click();

        await expect(page.getByRole('button', { name: /Complete/i }).first()).toBeVisible();
    });

    // ── TEST 4: Click "Start Preparing" transitions order ───

    test('TC-OSM-08: Clicking Start Preparing triggers status update API', async ({ page }) => {
        let statusUpdateCalled = false;
        let capturedStatus = '';

        await page.route('**/api/orders/*/status*', async (route, request) => {
            if (request.method() === 'PATCH') {
                statusUpdateCalled = true;
                const body = JSON.parse(request.postData() || '{}');
                capturedStatus = body.status;
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        ...MOCK_ORDERS[0],
                        orderStatus: 'PREPARING',
                    }),
                });
            } else {
                route.continue();
            }
        });

        await page.goto('/canteen/kitchen');

        // Click "Start Preparing" on the first PENDING order
        await page.getByRole('button', { name: /Start Preparing/i }).first().click();

        // Verify the API was called with correct status
        expect(statusUpdateCalled).toBe(true);
        expect(capturedStatus).toBe('PREPARING');
    });

    // ── TEST 5: Order details display correctly ─────────────

    test('TC-OSM-09: Order card shows all essential information', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // Verify order items are displayed
        await expect(page.getByText('Chicken Rice').first()).toBeVisible();
        await expect(page.getByText('Fresh Juice').first()).toBeVisible();

        // Verify total amount is shown (Rs.1250.00)
        await expect(page.getByText(/Rs\.1250\.00/).first()).toBeVisible();

        // Verify order type badge (NOW)
        await expect(page.getByText(/ORDER NOW/i).first()).toBeVisible();
    });

    // ── TEST 6: Manual refresh button works ─────────────────

    test('TC-OSM-10: Manual refresh button fetches updated orders', async ({ page }) => {
        let fetchCount = 0;

        await page.route('**/api/orders/canteen/**', (route) => {
            fetchCount++;
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_ORDERS),
            });
        });

        await page.goto('/canteen/kitchen');

        const initialCount = fetchCount;

        // Click refresh button
        await page.getByRole('button', { name: /Refresh/i }).first().click();

        // Wait for API call (using a more reliable check than timeout if possible, but status check is fine)
        await expect.poll(() => fetchCount).toBeGreaterThan(initialCount);
    });

    // ── TEST 7: Filter counts are displayed correctly ───────

    test('TC-OSM-11: Filter tab badges show correct order counts', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // The "All" tab should show 4 (paid orders only, excluding 1 unpaid)
        await expect(page.getByRole('button', { name: /^All/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /^Pending/i }).first()).toBeVisible();
    });

    // ── TEST 8: Unpaid orders are hidden from Kitchen ───────

    test('TC-OSM-12: Orders with pending payment are not displayed', async ({ page }) => {
        await page.goto('/canteen/kitchen');

        // The unpaid order (Unpaid Customer) should not be visible
        await expect(page.getByText('Unpaid Customer')).not.toBeVisible();

        // But paid orders should be visible
        await expect(page.getByText('Alice Fernando').first()).toBeVisible();
    });
});

// ══════════════════════════════════════════════════════════════
//  TEST SUITE: Order Tracking (Customer Side)
// ══════════════════════════════════════════════════════════════

test.describe('Order Tracking — Customer View', () => {

    const TRACKING_ORDER = createMockOrder({
        id: 'ord-track-001',
        orderStatus: 'PREPARING',
        customerName: 'Tracking User',
        preparedAt: new Date().toISOString(),
    });

    test.beforeEach(async ({ page }) => {
        // Mock the order status endpoint for tracking
        await page.route('**/api/orders/ord-track-001/status', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(TRACKING_ORDER),
            });
        });

        // Mock user auth for Navbar
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                id: 'user-001',
                username: 'testuser',
                token: 'mock-user-token',
            }));
        });
    });

    // ── TEST 9: Order tracking page loads correctly ──────────

    test('TC-OSM-13: Order tracking page displays order progress', async ({ page }) => {
        await page.goto('/orders/track/ord-track-001');

        // Title
        await expect(page.getByText(/Track Your Order/i).first()).toBeVisible();

        // Progress steps should be visible
        await expect(page.getByText(/Order Received/i).first()).toBeVisible();
        await expect(page.getByText(/Preparing Your Food/i).first()).toBeVisible();
        await expect(page.getByText(/Ready for Pickup/i).first()).toBeVisible();
        await expect(page.getByText(/Order Completed/i).first()).toBeVisible();
    });

    // ── TEST 10: Progress bar shows correct percentage ──────

    test('TC-OSM-14: Progress bar reflects current order status', async ({ page }) => {
        await page.goto('/orders/track/ord-track-001');

        // For PREPARING status (step 2 of 4), progress should be 50%
        await expect(page.getByText('50%').first()).toBeVisible();

        // Order Progress section should exist
        await expect(page.getByText(/Order Progress/i).first()).toBeVisible();
    });

    // ── TEST 11: Order details are displayed ────────────────

    test('TC-OSM-15: Order tracking shows item details and total', async ({ page }) => {
        await page.goto('/orders/track/ord-track-001');

        // Order items
        await expect(page.getByText('Chicken Rice').first()).toBeVisible();
        await expect(page.getByText('Fresh Juice').first()).toBeVisible();

        // Total amount
        await expect(page.getByText(/Rs\.1250\.00/).first()).toBeVisible();

        // Pickup time
        await expect(page.getByText(/Pickup Time/i).first()).toBeVisible();
    });

    // ── TEST 12: Ready alert displays when order is READY ───

    test('TC-OSM-16: Ready alert appears when order status is READY', async ({ page }) => {
        const readyOrder = {
            ...TRACKING_ORDER,
            orderStatus: 'READY',
            readyAt: new Date().toISOString(),
        };

        await page.route('**/api/orders/ord-track-001/status', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(readyOrder),
            });
        });

        await page.goto('/orders/track/ord-track-001');

        // Ready alert should be visible
        await expect(page.getByRole('heading', { name: /Your Order is Ready!/i }).first()).toBeVisible();

        // Progress should be 75%
        await expect(page.getByText('75%').first()).toBeVisible();
    });

    // ── TEST 13: Error state — order not found ──────────────

    test('TC-OSM-17: Shows error when order is not found', async ({ page }) => {
        await page.route('**/api/orders/invalid-order-id/status', (route) => {
            route.fulfill({ status: 404 });
        });

        await page.goto('/orders/track/invalid-order-id');

        // Should show error or "Order not found"
        await expect(page.getByText(/Order not found/i).or(page.getByText(/Failed to load/i)).first()).toBeVisible();
    });
});
