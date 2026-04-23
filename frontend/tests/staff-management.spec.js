import { test, expect } from '@playwright/test';

test.describe('Staff Management System', () => {

    // ─── Shared mock data ───
    const MOCK_OWNER = { id: 'O-100', ownerName: 'John Fernando', email: 'john@campuseats.lk', canteenId: 'CAN-001', token: 'mock-jwt-token' };
    const MOCK_CANTEEN = { id: 'CAN-001', canteenName: 'Maharagama Canteen', status: 'APPROVED', active: true };
    const MOCK_STAFF = [
        { id: 'ST-1', staffName: 'Kamal Perera', role: 'COOK', phone: '0771112233', nicNumber: '200012345678', employmentType: 'FULL_TIME', payType: 'MONTHLY', payRate: 45000, status: 'ACTIVE', joinDate: '2025-01-15', bankName: 'BOC', accountNumber: '1234567890', bankBranch: 'Colombo' },
        { id: 'ST-2', staffName: 'Nimal Silva', role: 'HELPER', phone: '0772223344', nicNumber: '199987654321', employmentType: 'PART_TIME', payType: 'HOURLY', payRate: 350, status: 'ACTIVE', joinDate: '2025-03-10', bankName: '', accountNumber: '', bankBranch: '' },
        { id: 'ST-3', staffName: 'Saman Kumara', role: 'CASHIER', phone: '0773334455', nicNumber: '198765432109', employmentType: 'CONTRACT', payType: 'MONTHLY', payRate: 35000, status: 'TERMINATED', joinDate: '2024-06-01', bankName: 'HNB', accountNumber: '9876543210', bankBranch: 'Kandy' },
        { id: 'ST-4', staffName: 'Ruwan Bandara', role: 'DELIVERY', phone: '0774445566', nicNumber: '200199887766', employmentType: 'FULL_TIME', payType: 'MONTHLY', payRate: 40000, status: 'ACTIVE', joinDate: '2025-06-20', bankName: '', accountNumber: '', bankBranch: '' },
    ];

    const setupStaffMocks = async (page, overrides = {}) => {
        await page.addInitScript((owner) => {
            localStorage.setItem('canteenOwner', JSON.stringify(owner));
        }, overrides.owner || MOCK_OWNER);

        await page.route('**/api/canteens/CAN-001', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/canteens/owner/*', async route => {
            await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
        });
        await page.route('**/api/staff/canteen/CAN-001', async route => {
            if (route.request().url().includes('/count') || route.request().url().includes('/active')) {
                await route.continue();
            } else {
                await route.fulfill({ status: 200, json: overrides.staff || MOCK_STAFF });
            }
        });
        await page.route('**/api/staff/canteen/CAN-001/count', async route => {
            await route.fulfill({ status: 200, json: 3 });
        });
        await page.route('**/api/menu-items/canteen/CAN-001', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
    };


    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Staff management page renders with staff table
    // ═══════════════════════════════════════════════════════════════
    test('should render staff management page with staff table', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Page title
        await expect(page.locator('text=Staff Management')).toBeVisible();

        // Table headers
        await expect(page.locator('th:has-text("Name")')).toBeVisible();
        await expect(page.locator('th:has-text("Role")')).toBeVisible();
        await expect(page.locator('th:has-text("Employment")')).toBeVisible();
        await expect(page.locator('th:has-text("Pay")')).toBeVisible();
        await expect(page.locator('th:has-text("Status")')).toBeVisible();

        // Staff members in table
        await expect(page.locator('text=Kamal Perera')).toBeVisible();
        await expect(page.locator('text=Nimal Silva')).toBeVisible();
        await expect(page.locator('text=Saman Kumara')).toBeVisible();
        await expect(page.locator('text=Ruwan Bandara')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 2: Statistics cards display correct counts
    // ═══════════════════════════════════════════════════════════════
    test('should display correct staff statistics', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        await expect(page.locator('p:has-text("Total Staff")')).toBeVisible();
        await expect(page.locator('p:has-text("4")').first()).toBeVisible();

        await expect(page.locator('p:has-text("Active")').first()).toBeVisible();

        await expect(page.locator('p:has-text("Terminated")').first()).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 3: Add Staff modal opens and validates form
    // ═══════════════════════════════════════════════════════════════
    test('should open add staff modal and validate required fields', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Click "Add Staff" button
        await page.locator('button:has-text("Add Staff")').first().click();

        // Modal should open
        await expect(page.locator('text=Add New Staff')).toBeVisible();

        // Fill in partial data (leave phone empty to trigger validation)
        await page.locator('input[placeholder="Full name"]').fill('Test Staff');
        await page.locator('input[placeholder="0.00"]').fill('30000');
        await page.locator('input[placeholder="National ID"]').fill('200012345678');
        await page.locator('input[type="date"]').fill('2026-01-01');

        // Phone is empty — button should be disabled since !formData.phone
        const saveButton = page.locator('button:has-text("Add Staff")').last();
        await expect(saveButton).toBeDisabled();

        // Now fill phone
        await page.locator('input[placeholder="07X XXX XXXX"]').fill('0771234567');

        // Now the button should be enabled
        await expect(saveButton).toBeEnabled();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 4: Add Staff modal validates NIC format
    // ═══════════════════════════════════════════════════════════════
    test('should validate NIC number format', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        await page.locator('button:has-text("Add Staff")').first().click();

        // Fill all required fields with invalid NIC
        await page.locator('input[placeholder="Full name"]').fill('Test Staff');
        await page.locator('input[placeholder="07X XXX XXXX"]').fill('0771234567');
        await page.locator('input[placeholder="National ID"]').fill('INVALID');
        await page.locator('input[placeholder="0.00"]').fill('30000');
        await page.locator('input[type="date"]').fill('2026-01-01');

        // Mock the create API
        await page.route('**/api/staff', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 200, json: { id: 'ST-NEW', staffName: 'Test Staff', status: 'ACTIVE' } });
            }
        });

        // Click save
        const saveButton = page.locator('button:has-text("Add Staff")').last();
        await saveButton.click();

        // Should show NIC validation error
        await expect(page.locator('text=Invalid NIC format')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 5: Successfully create a new staff member
    // ═══════════════════════════════════════════════════════════════
    test('should successfully create a new staff member', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Open modal
        await page.locator('button:has-text("Add Staff")').first().click();

        // Fill all required fields
        await page.locator('input[placeholder="Full name"]').fill('Amara Kumari');
        await page.locator('input[placeholder="07X XXX XXXX"]').fill('0771234567');
        await page.locator('input[placeholder="National ID"]').fill('200012345678');
        await page.locator('input[placeholder="0.00"]').fill('35000');
        await page.locator('input[type="date"]').fill('2026-04-01');

        // Mock the create API and update the list mock to include the new staff
        const NEW_STAFF_MEMBER = { id: 'ST-NEW', staffName: 'Amara Kumari', role: 'COOK', phone: '0771234567', nicNumber: '200012345678', payRate: 35000, status: 'ACTIVE' };
        
        await page.route('**/api/staff', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 200, json: NEW_STAFF_MEMBER });
            }
        });

        await page.route('**/api/staff/canteen/CAN-001', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, json: [...MOCK_STAFF, NEW_STAFF_MEMBER] });
            }
        });

        // Click save
        const saveButton = page.locator('button:has-text("Add Staff")').last();
        await saveButton.click();

        // Modal should close and new staff should appear
        await expect(page.locator('text=Amara Kumari')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 6: Search/filter functionality
    // ═══════════════════════════════════════════════════════════════
    test('should filter staff by search query', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Search for "Kamal"
        await page.locator('input[placeholder="Search staff by name or role..."]').fill('Kamal');

        // Only Kamal should be visible
        await expect(page.locator('text=Kamal Perera')).toBeVisible();
        await expect(page.locator('text=Nimal Silva')).not.toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 7: Filter by status
    // ═══════════════════════════════════════════════════════════════
    test('should filter staff by status', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Select TERMINATED filter
        await page.selectOption('select', 'TERMINATED');

        // Only terminated staff should be visible
        await expect(page.locator('text=Saman Kumara')).toBeVisible();
        await expect(page.locator('text=Kamal Perera')).not.toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 8: Deactivate staff shows confirmation
    // ═══════════════════════════════════════════════════════════════
    test('should show confirmation when deactivating active staff', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss();
        });

        // Click deactivate button on an active staff
        await page.locator('button:has-text("Deactivate")').first().click();

        expect(dialogMessage).toContain('deactivate');
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 9: Edit staff opens modal with pre-filled data
    // ═══════════════════════════════════════════════════════════════
    test('should pre-populate form when editing staff member', async ({ page }) => {
        await setupStaffMocks(page);
        await page.goto('/canteen/staff');

        // Click "Edit" on the row that contains "Kamal Perera"
        const kamalRow = page.locator('tr:has-text("Kamal Perera")');
        await kamalRow.locator('button:has-text("Edit")').click();

        // Modal should show "Edit Staff"
        await expect(page.locator('text=Edit Staff')).toBeVisible();

        // Verify pre-filled data
        const nameInput = page.locator('input[placeholder="Full name"]');
        await expect(nameInput).toHaveValue('Kamal Perera');

        // Should show "Update Staff" instead of "Add Staff"
        await expect(page.locator('button:has-text("Update Staff")')).toBeVisible();
    });


    // ═══════════════════════════════════════════════════════════════
    // TEST 10: Empty state when no staff exist
    // ═══════════════════════════════════════════════════════════════
    test('should show empty state when no staff exist', async ({ page }) => {
        await setupStaffMocks(page, { staff: [] });
        await page.goto('/canteen/staff');

        await expect(page.locator('text=No staff members yet')).toBeVisible();
    });

});
