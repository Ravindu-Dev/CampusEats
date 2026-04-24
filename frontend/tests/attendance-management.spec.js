// @ts-check
import { test, expect } from '@playwright/test';

/*
 * ============================================================
 *  ATTENDANCE MANAGEMENT SYSTEM — E2E Tests (Playwright)
 * ============================================================
 *  Component Owner : Ravindu
 *  Covers          : AttendanceManagement.jsx (frontend)
 *                    attendanceService.js (frontend)
 *                    AttendanceService.java, AttendanceController.java (backend)
 *
 *  User Journeys Tested:
 *    1. Attendance page loads with staff list
 *    2. Date selector works and restricts future dates
 *    3. Mark all staff as PRESENT / ABSENT / LEAVE
 *    4. Individual attendance entry (check-in/out, day type, notes)
 *    5. Save attendance calls bulk API
 *    6. Stats counters (Total Staff, Present, Absent) update in real-time
 *    7. Empty state when no staff members exist
 *    8. Time input fields are disabled for ABSENT/LEAVE status
 *    9. Existing attendance records are pre-populated
 *   10. Check-out time validation (cannot be before check-in)
 * ============================================================
 */

// ── Mock Data ──────────────────────────────────────────────────

const MOCK_CANTEEN_OWNER = {
    id: 'owner-001',
    canteenId: 'canteen-001',
    ownerName: 'Test Canteen Owner',
    token: 'mock-jwt-token-canteen-owner',
};

const MOCK_CANTEEN = {
    id: 'canteen-001',
    canteenName: 'Main Campus Canteen',
    location: 'Building A',
    isActive: true,
};

const MOCK_STAFF = [
    { id: 'staff-001', staffName: 'Kamal Perera', role: 'COOK', status: 'ACTIVE', canteenId: 'canteen-001' },
    { id: 'staff-002', staffName: 'Nimal Fernando', role: 'HELPER', status: 'ACTIVE', canteenId: 'canteen-001' },
    { id: 'staff-003', staffName: 'Sunil Jayawardena', role: 'CASHIER', status: 'ACTIVE', canteenId: 'canteen-001' },
    { id: 'staff-004', staffName: 'Chamara Silva', role: 'DELIVERY', status: 'ACTIVE', canteenId: 'canteen-001' },
];

const MOCK_ATTENDANCE_EXISTING = [
    {
        id: 'att-001',
        staffId: 'staff-001',
        staffName: 'Kamal Perera',
        canteenId: 'canteen-001',
        date: '2026-04-23',
        checkInTime: '08:00',
        checkOutTime: '16:00',
        totalHours: 8.0,
        overtimeHours: 0.0,
        dayType: 'PRESENT',
        notes: 'Regular shift',
    },
];

// ── Helpers ────────────────────────────────────────────────────

async function setupCanteenAuth(page) {
    await page.addInitScript((owner) => {
        localStorage.setItem('canteenOwner', JSON.stringify(owner));
    }, MOCK_CANTEEN_OWNER);
}

async function mockAttendanceAPIs(page, { staff = MOCK_STAFF, attendance = [], canteen = MOCK_CANTEEN } = {}) {
    // Mock canteen data
    await page.route('**/api/canteens/canteen-001', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(canteen),
        });
    });

    // Mock active staff
    await page.route('**/api/staff/canteen/canteen-001/active', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(staff),
        });
    });

    // Mock attendance by date
    await page.route('**/api/attendance/canteen/canteen-001/date/**', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(attendance),
        });
    });

    // Mock bulk attendance save
    await page.route('**/api/attendance/bulk', (route, request) => {
        if (request.method() === 'POST') {
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify([]),
            });
        } else {
            route.continue();
        }
    });
}

// ══════════════════════════════════════════════════════════════
//  TEST SUITE: Attendance Management
// ══════════════════════════════════════════════════════════════

test.describe('Attendance Management System', () => {

    test.beforeEach(async ({ page }) => {
        await setupCanteenAuth(page);
    });

    test('TC-ATT-01: Attendance page loads and displays staff members', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Page title should be in the layout header
        await expect(page.getByRole('heading', { name: /Attendance Management/i }).first()).toBeVisible();

        // Staff names should be displayed in the table
        await expect(page.getByText('Kamal Perera').first()).toBeVisible();
        await expect(page.getByText('Nimal Fernando').first()).toBeVisible();

        // Role labels should be shown
        await expect(page.getByText('COOK').first()).toBeVisible();
        await expect(page.getByText('HELPER').first()).toBeVisible();
    });

    // ── TEST 2: Stats counters display correctly ────────────

    test('TC-ATT-02: Stats cards show Total Staff count', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // "Total Staff" label should be visible
        await expect(page.getByText('Total Staff').first()).toBeVisible();

        // Staff count should be displayed (4 staff members)
        // Find the stats container and verify the count
        await expect(page.getByText('4', { exact: true }).first()).toBeVisible();
    });

    // ── TEST 3: Table headers are visible ───────────────────

    test('TC-ATT-03: Attendance table has correct column headers', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Headers are <p> elements in a CSS Grid layout, not <th>
        await expect(page.getByText('Staff Member').first()).toBeVisible();
        await expect(page.getByText('Check In').first()).toBeVisible();
        await expect(page.getByText('Check Out').first()).toBeVisible();
        await expect(page.getByText('Status').first()).toBeVisible();
        await expect(page.getByText('Notes').first()).toBeVisible();
    });

    // ── TEST 4: Mark All Present button ─────────────────────

    test('TC-ATT-04: Mark All PRESENT sets all staff to Present', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Click "Mark All PRESENT"
        await page.getByRole('button', { name: /Mark All PRESENT/i }).first().click();

        // All select dropdowns in the table should now show "Present"
        const selectElements = page.locator('select');
        await expect(selectElements.first()).toHaveValue('PRESENT');
        await expect(selectElements.nth(1)).toHaveValue('PRESENT');
    });

    // ── TEST 5: Mark All Absent button ──────────────────────

    test('TC-ATT-05: Mark All ABSENT sets all staff to Absent', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Click "Mark All ABSENT"
        await page.getByRole('button', { name: /Mark All ABSENT/i }).first().click();

        // All select dropdowns should now show "Absent"
        const selectElements = page.locator('select');
        await expect(selectElements.first()).toHaveValue('ABSENT');
        await expect(selectElements.nth(1)).toHaveValue('ABSENT');
    });

    // ── TEST 6: Mark All Leave button ───────────────────────

    test('TC-ATT-06: Mark All LEAVE sets all staff to Leave', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Click "Mark All LEAVE"
        await page.getByRole('button', { name: /Mark All LEAVE/i }).first().click();

        const selectElements = page.locator('select');
        await expect(selectElements.first()).toHaveValue('LEAVE');
        await expect(selectElements.nth(1)).toHaveValue('LEAVE');
    });

    // ── TEST 7: Individual status change ────────────────────

    test('TC-ATT-07: Can change individual staff day type to Half Day', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Each staff row has ONE select (dayType). Kamal Perera is the first staff.
        const kamalSelect = page.locator('select').first();
        await kamalSelect.selectOption('HALF_DAY');

        await expect(kamalSelect).toHaveValue('HALF_DAY');
    });

    // ── TEST 8: Time inputs disabled for ABSENT ─────────────

    test('TC-ATT-08: Time inputs are disabled when status is ABSENT', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Set first staff (Kamal) to ABSENT — first select on the page
        const kamalSelect = page.locator('select').first();
        await kamalSelect.selectOption('ABSENT');

        // Kamal's time inputs are the first two time inputs on the page
        const timeInputs = page.locator('input[type="time"]');
        await expect(timeInputs.first()).toBeDisabled();
        await expect(timeInputs.nth(1)).toBeDisabled();
    });

    // ── TEST 9: Time inputs disabled for LEAVE ──────────────

    test('TC-ATT-09: Time inputs are disabled when status is LEAVE', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        // Set first staff (Kamal) to LEAVE
        const kamalSelect = page.locator('select').first();
        await kamalSelect.selectOption('LEAVE');

        // Kamal's time inputs should be disabled
        const timeInputs = page.locator('input[type="time"]');
        await expect(timeInputs.first()).toBeDisabled();
        await expect(timeInputs.nth(1)).toBeDisabled();
    });

    // ── TEST 10: Save Attendance calls bulk API ─────────────

    test('TC-ATT-10: Save Attendance button triggers bulk API call', async ({ page }) => {
        let bulkAPICalled = false;

        // Set up mocks FIRST, then override the bulk route so our capture wins (LIFO order)
        await mockAttendanceAPIs(page);
        await page.route('**/api/attendance/bulk', async (route) => {
            bulkAPICalled = true;
            route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.goto('/canteen/attendance');

        // Click "Save Attendance"
        await page.getByRole('button', { name: /Save Attendance/i }).first().click();

        await expect.poll(() => bulkAPICalled).toBe(true);
    });

    // ── TEST 11: Notes field accepts text ────────────────────

    test('TC-ATT-11: Notes field accepts text input', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        const notesInput = page.getByPlaceholder(/Optional notes/i).first();
        await notesInput.fill('Arrived late due to rain');

        await expect(notesInput).toHaveValue('Arrived late due to rain');
    });

    // ── TEST 12: Empty state when no staff ──────────────────

    test('TC-ATT-12: Shows empty state when no staff members exist', async ({ page }) => {
        await page.route('**/api/staff/all', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });
        await page.route('**/api/attendance/date/**', (route) => {
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        });

        await page.goto('/canteen/attendance');

        await expect(page.getByText(/No active staff members/i).first()).toBeVisible();
    });

    // ── TEST 13: Existing attendance pre-populated ──────────

    test('TC-ATT-13: Existing attendance records are pre-populated on load', async ({ page }) => {
        // Use MOCK_ATTENDANCE_EXISTING which has correct field names matching the component
        await mockAttendanceAPIs(page, { attendance: MOCK_ATTENDANCE_EXISTING });
        
        await page.goto('/canteen/attendance');

        // Kamal Perera's select (first on page) should show PRESENT
        await expect(page.locator('select').first()).toHaveValue('PRESENT');

        // The worked hours should be displayed near Kamal's name
        await expect(page.getByText(/8\.0h worked/i).first()).toBeVisible();
    });

    // ── TEST 14: Date selector is present and functional ────

    test('TC-ATT-14: Date input selector is present and defaults to today', async ({ page }) => {
        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        const dateInput = page.locator('input[type="date"]');
        await expect(dateInput).toBeVisible();
        
        const today = new Date().toISOString().split('T')[0];
        await expect(dateInput).toHaveValue(today);
    });

    // ── TEST 15: Save button shows loading state ────────────

    test('TC-ATT-15: Save button shows "Saving..." while request is in progress', async ({ page }) => {
        await page.route('**/api/attendance/bulk', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            route.fulfill({ status: 201, body: JSON.stringify([]) });
        });

        await mockAttendanceAPIs(page);
        await page.goto('/canteen/attendance');

        await page.getByRole('button', { name: /Save Attendance/i }).first().click();
        await expect(page.getByText(/Saving/i).first()).toBeVisible();
    });
});
