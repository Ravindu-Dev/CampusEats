import { test, expect } from '@playwright/test';

test.describe('Menu Management System', () => {

    // ─── Shared mock data ───
    const MOCK_OWNER = { id: 'O-100', ownerName: 'John Fernando', email: 'john@campuseats.lk', canteenId: 'CAN-001', token: 'mock-jwt-token' };
    const MOCK_CANTEEN = { id: 'CAN-001', canteenName: 'Maharagama Canteen', status: 'APPROVED', active: true };
    const MOCK_MENU_ITEMS = [
        { id: 'MI-1', name: 'Chicken Kottu', description: 'Spicy chicken kottu roti', price: 625, category: 'Lunch', canteenId: 'CAN-001', available: true, vegetarian: false, imageUrl: 'https://placehold.co/300x200' },
        { id: 'MI-2', name: 'Vegetable Fried Rice', description: 'Mixed veggie fried rice', price: 550, category: 'Lunch', canteenId: 'CAN-001', available: true, vegetarian: true, imageUrl: 'https://placehold.co/300x200' },
        { id: 'MI-3', name: 'Hot Coffee', description: 'Fresh brewed coffee', price: 150, category: 'Beverages', canteenId: 'CAN-001', available: true, vegetarian: true, imageUrl: '' },
        { id: 'MI-4', name: 'Egg Hopper', description: 'Traditional egg hopper', price: 120, category: 'Breakfast', canteenId: 'CAN-001', available: false, vegetarian: false, imageUrl: '' },
    ];

    const setupMenuMocks = async (page, overrides = {}) => {
        await page.addInitScript((owner) => {
            localStorage.setItem('canteenOwner', JSON.stringify(owner));
        }, overrides.owner || MOCK_OWNER);

        await page.route('**/api/canteens/owner/*', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/canteens/CAN-001', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/menu-items/canteen/CAN-001', async route => {
            await route.fulfill({ status: 200, json: overrides.menuItems || MOCK_MENU_ITEMS });
        });
        await page.route('**/api/staff/canteen/CAN-001/count', async route => {
            await route.fulfill({ status: 200, json: 3 });
        });
    };


    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Menu management page renders with items grouped by category
    // ═══════════════════════════════════════════════════════════════
    test('should render menu items grouped by category', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Page title
        await expect(page.locator('text=Menu Management')).toBeVisible();

        // Category headers should be visible for categories that have items
        await expect(page.locator('h3:has-text("Lunch")').first()).toBeVisible();
        await expect(page.locator('h3:has-text("Beverages")').first()).toBeVisible();
        await expect(page.locator('h3:has-text("Breakfast")').first()).toBeVisible();

        // Individual menu items
        await expect(page.locator('text=Chicken Kottu').first()).toBeVisible();
        await expect(page.locator('text=Vegetable Fried Rice').first()).toBeVisible();
        await expect(page.locator('text=Hot Coffee').first()).toBeVisible();

        // Price display
        await expect(page.locator('text=Rs.625').first()).toBeVisible();
        await expect(page.locator('text=Rs.550').first()).toBeVisible();
        await expect(page.locator('text=Rs.150').first()).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 2: "Out of Stock" overlay for unavailable items
    // ═══════════════════════════════════════════════════════════════
    test('should show out of stock overlay for unavailable items', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Egg Hopper (MI-4) is marked as available: false
        await expect(page.locator('text=Egg Hopper').first()).toBeVisible();
        await expect(page.locator('text=Out of Stock').first()).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 3: Add New Item form opens and submits
    // ═══════════════════════════════════════════════════════════════
    test('should open add new item form and submit successfully', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Click "Add New Item" button
        await page.locator('button:has-text("+ Add New Item")').click();

        // Form should appear
        await expect(page.locator('text=Add New Menu Item')).toBeVisible();

        // Fill in the form
        await page.fill('input[name="name"]', 'String Hoppers');
        await page.fill('textarea[name="description"]', 'Traditional string hoppers with curry');
        await page.fill('input[name="price"]', '200');
        await page.selectOption('select[name="category"]', 'Breakfast');

        // Mock the create API
        await page.route('**/api/menu-items', async route => {
            if (route.request().method() === 'POST') {
                const body = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    json: { id: 'MI-NEW', ...body }
                });
            }
        });

        // Submit
        await page.locator('button[type="submit"]:has-text("Add Item")').click();

        // Success message
        await expect(page.locator('text=Item added successfully!')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 4: Cancel button closes the form
    // ═══════════════════════════════════════════════════════════════
    test('should toggle form visibility with Add/Cancel button', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Initially form is hidden
        await expect(page.locator('text=Add New Menu Item')).not.toBeVisible();

        // Open form
        await page.locator('button:has-text("+ Add New Item")').click();
        await expect(page.locator('text=Add New Menu Item')).toBeVisible();

        // Close form via Cancel button
        await page.locator('button:has-text("Cancel")').first().click();
        await expect(page.locator('text=Add New Menu Item')).not.toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 5: Empty menu state shows prompt
    // ═══════════════════════════════════════════════════════════════
    test('should show empty state when no menu items exist', async ({ page }) => {
        await setupMenuMocks(page, { menuItems: [] });
        await page.goto('/canteen/menu-management');

        await expect(page.locator('text=No menu items yet')).toBeVisible();
        await expect(page.locator('text=Start building your menu')).toBeVisible();
        await expect(page.locator('button:has-text("+ Add Your First Item")')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 6: Edit menu item form pre-populates with item data
    // ═══════════════════════════════════════════════════════════════
    test('should pre-populate form when editing a menu item', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Click the edit button on the card that contains "Chicken Kottu"
        const kottuCard = page.locator('div.group:has-text("Chicken Kottu")').first();
        await kottuCard.locator('button[title="Edit"]').click();

        // Form should show "Edit Menu Item"
        await expect(page.locator('text=Edit Menu Item')).toBeVisible();

        // Pre-filled values
        const nameInput = page.locator('input[name="name"]');
        await expect(nameInput).toHaveValue('Chicken Kottu');

        const priceInput = page.locator('input[name="price"]');
        await expect(priceInput).toHaveValue('625');

        // Submit button should say "Update Item"
        await expect(page.locator('button[type="submit"]:has-text("Update Item")')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 7: Delete menu item triggers confirmation
    // ═══════════════════════════════════════════════════════════════
    test('should show confirmation dialog when deleting a menu item', async ({ page }) => {
        await setupMenuMocks(page);
        await page.goto('/canteen/menu-management');

        // Listen for dialog events (confirm)
        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss(); // Click cancel on the confirm dialog
        });

        // Click the delete button on the first item
        const deleteButtons = page.locator('button[title="Delete"]');
        await deleteButtons.first().click();

        // Verify the confirmation dialog message
        expect(dialogMessage).toContain('Are you sure you want to delete this item?');
    });

});
