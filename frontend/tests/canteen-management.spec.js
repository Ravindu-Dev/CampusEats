import { test, expect } from '@playwright/test';

test.describe('Canteen Management System', () => {

    // ─── Shared mock data ───
    const MOCK_OWNER = { id: 'O-100', ownerName: 'John Fernando', email: 'john@campuseats.lk', canteenId: 'CAN-001', token: 'mock-jwt-token' };
    const MOCK_CANTEEN = {
        id: 'CAN-001', ownerId: 'O-100', canteenName: 'Maharagama Canteen', location: 'Block B', campus: 'Main Campus',
        floorNumber: '2', roomNumber: '205', phoneNumber: '0771234567', alternativeContactNumber: '0779876543',
        openingTime: '08:00', closingTime: '20:00', description: 'Authentic Sri Lankan cuisine for students',
        cuisineTypes: ['INDIAN', 'CHINESE'], operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        seatingCapacity: 50, averagePreparationTime: 15, deliveryAvailable: true, pickupAvailable: true,
        status: 'APPROVED', logoUrl: 'https://placehold.co/100', rating: 4.5, totalRatings: 120, ownerName: 'John Fernando',
        active: true
    };
    const MOCK_ORDERS = [
        { id: 'ORD-ABC123', customerName: 'Kasun Perera', orderStatus: 'COMPLETED', paymentStatus: 'succeeded', totalAmount: 1250, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), orderItems: [{ name: 'Chicken Kottu', quantity: 2, price: 625 }] },
        { id: 'ORD-DEF456', customerName: 'Saman Silva', orderStatus: 'READY', paymentStatus: 'succeeded', totalAmount: 800, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), orderItems: [{ name: 'Fried Rice', quantity: 1, price: 800 }] },
        { id: 'ORD-GHI789', customerName: 'Nimali Dias', orderStatus: 'PREPARING', paymentStatus: 'succeeded', totalAmount: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), orderItems: [{ name: 'Nasi Goreng', quantity: 1, price: 500 }] },
    ];
    const MOCK_MENU_ITEMS = [
        { id: 'MI-1', name: 'Chicken Kottu', price: 625, category: 'Lunch', canteenId: 'CAN-001', available: true },
        { id: 'MI-2', name: 'Fried Rice', price: 800, category: 'Lunch', canteenId: 'CAN-001', available: true },
        { id: 'MI-3', name: 'Hot Coffee', price: 150, category: 'Beverages', canteenId: 'CAN-001', available: true },
    ];

    // Helper to set up mocks for the canteen dashboard
    const setupCanteenDashboardMocks = async (page, overrides = {}) => {
        await page.addInitScript((owner) => {
            localStorage.setItem('canteenOwner', JSON.stringify(owner));
        }, overrides.owner || MOCK_OWNER);

        await page.route('**/api/canteens/CAN-001', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/canteens/owner/*', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/orders/canteen/CAN-001*', async route => {
            await route.fulfill({ status: 200, json: overrides.orders || MOCK_ORDERS });
        });
        await page.route('**/api/menu-items/canteen/CAN-001', async route => {
            await route.fulfill({ status: 200, json: overrides.menuItems || MOCK_MENU_ITEMS });
        });
        await page.route('**/api/staff/canteen/CAN-001/count', async route => {
            await route.fulfill({ status: 200, json: 5 });
        });
    };


    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Dashboard renders with correct statistics
    // ═══════════════════════════════════════════════════════════════
    test('should render canteen dashboard with correct statistics', async ({ page }) => {
        await setupCanteenDashboardMocks(page);
        await page.goto('/canteen/dashboard');

        // Owner welcome message
        await expect(page.locator('text=Welcome back, John Fernando!')).toBeVisible();

        // Stats cards — Total Orders (3 successful), Today's Revenue, Avg Rating, Menu Items
        await expect(page.locator('text=Total Orders')).toBeVisible();
        await expect(page.locator('text=3').first()).toBeVisible(); // 3 orders with succeeded payment

        await expect(page.locator("text=Today's Revenue")).toBeVisible();

        await expect(page.locator('text=Avg Rating')).toBeVisible();
        await expect(page.locator('text=4.5')).toBeVisible();

        await expect(page.locator('text=Menu Items')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 2: Canteen details panel shows correct information
    // ═══════════════════════════════════════════════════════════════
    test('should display canteen details correctly', async ({ page }) => {
        await setupCanteenDashboardMocks(page);
        await page.goto('/canteen/dashboard');

        // Verify canteen information panel
        await expect(page.locator('text=Canteen Details')).toBeVisible();
        await expect(page.locator('text=Maharagama Canteen').first()).toBeVisible();
        await expect(page.locator('text=Block B').first()).toBeVisible();
        await expect(page.locator('text=08:00 - 20:00')).toBeVisible();
        await expect(page.locator('text=0771234567').first()).toBeVisible();
        await expect(page.locator('text=Authentic Sri Lankan cuisine for students')).toBeVisible();

        // Cuisine type badges
        await expect(page.locator('text=INDIAN')).toBeVisible();
        await expect(page.locator('text=CHINESE')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 3: Owner details panel shows correct information
    // ═══════════════════════════════════════════════════════════════
    test('should display owner details panel correctly', async ({ page }) => {
        await setupCanteenDashboardMocks(page);
        await page.goto('/canteen/dashboard');

        await expect(page.locator('text=Owner Details')).toBeVisible();
        await expect(page.locator('text=John Fernando').first()).toBeVisible();
        await expect(page.locator('text=Canteen Owner')).toBeVisible();
        await expect(page.locator('text=john@campuseats.lk').first()).toBeVisible();
        await expect(page.locator('text=Email cannot be changed')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 4: Recent completed orders display
    // ═══════════════════════════════════════════════════════════════
    test('should display recent completed orders', async ({ page }) => {
        await setupCanteenDashboardMocks(page);
        await page.goto('/canteen/dashboard');

        await expect(page.locator('text=Recent Completed Orders')).toBeVisible();

        // Completed/Ready orders should appear (ORD-ABC123 → C123, ORD-DEF456 → F456)
        await expect(page.locator('text=C123').first()).toBeVisible();
        await expect(page.locator('text=Kasun Perera')).toBeVisible();
        await expect(page.locator('text=Rs.1250.00')).toBeVisible();

        // "View all orders" link
        await expect(page.locator('text=View all orders →')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 5: PENDING canteen shows status banner
    // ═══════════════════════════════════════════════════════════════
    test('should show pending status banner for unapproved canteen', async ({ page }) => {
        const pendingCanteen = { ...MOCK_CANTEEN, status: 'PENDING' };
        await setupCanteenDashboardMocks(page, { canteen: pendingCanteen });
        await page.goto('/canteen/dashboard');

        await expect(page.locator('text=Registration Status: PENDING')).toBeVisible();
        await expect(page.locator("text=Your canteen registration is under review")).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 6: Edit canteen details modal opens and validates
    // ═══════════════════════════════════════════════════════════════
    test('should open edit canteen modal and validate form inputs', async ({ page }) => {
        await setupCanteenDashboardMocks(page);
        await page.goto('/canteen/dashboard');

        // Click edit button on canteen details
        const editButtons = page.locator('button[title="Edit canteen details"]');
        await editButtons.first().click();

        // Modal should open
        await expect(page.locator('text=Edit Canteen Details')).toBeVisible();

        // Pre-populated fields
        const canteenNameInput = page.locator('input[name="canteenName"]');
        await expect(canteenNameInput).toHaveValue('Maharagama Canteen');

        // Clear required field to trigger validation
        await canteenNameInput.fill('');

        // Click save (mocked update endpoint)
        await page.route('**/api/canteens/CAN-001', async route => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({ status: 200, json: MOCK_CANTEEN });
            } else {
                await route.fulfill({ status: 200, json: MOCK_CANTEEN });
            }
        });

        // The Save Changes button
        const saveBtn = page.locator('button:has-text("Save Changes")');
        await saveBtn.click();

        // Should show validation error
        await expect(page.locator('text=Canteen name is required')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 7: Redirects to login if not authenticated
    // ═══════════════════════════════════════════════════════════════
    test('should redirect to canteen login if not authenticated', async ({ page }) => {
        // Do NOT set canteenOwner in localStorage
        await page.goto('/canteen/dashboard');
        await page.waitForURL('**/canteen/login');
        expect(page.url()).toContain('/canteen/login');
    });

});
