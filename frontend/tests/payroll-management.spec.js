import { test, expect } from '@playwright/test';

test.describe('Payroll Management System', () => {
    test.beforeEach(async ({ page }) => {
        // Authenticate as a Canteen Owner
        await page.addInitScript(() => {
            localStorage.setItem('canteenOwner', JSON.stringify({ 
                id: 'O-123', 
                ownerName: 'Admin', 
                canteenId: 'CAN-MAHA-1' 
            }));
            localStorage.setItem('canteenToken', 'fake-token-xyz');
        });

        // Mock getting standard canteen info
        await page.route('**/api/canteens/CAN-MAHA-1*', async route => {
            await route.fulfill({ status: 200, json: { id: 'CAN-MAHA-1', canteenName: 'Maha Oya Canteen' } });
        });
    });

    test('should generate a draft payroll via modal interaction', async ({ page }) => {
        // Define route toggling - initial mount loads an empty array
        let isPayrollGenerated = false;
        
        await page.route('**/api/payroll/canteen/CAN-MAHA-1*', async route => {
            if (!isPayrollGenerated) {
                await route.fulfill({ status: 200, json: [] });
            } else {
                await route.fulfill({ status: 200, json: [{
                    id: 'PAY-8811',
                    periodStart: '2026-04-01',
                    periodEnd: '2026-04-15',
                    totalStaffCount: 8,
                    status: 'DRAFT',
                    totalGrossPay: 120000,
                    totalNetPay: 115000,
                    createdAt: new Date().toISOString()
                }]});
            }
        });

        // Mock the POST save endpoint
        await page.route('**/api/payroll/generate*', async route => {
            isPayrollGenerated = true;
            await route.fulfill({
                status: 201, 
                json: {
                    id: 'PAY-8811',
                    periodStart: '2026-04-01',
                    periodEnd: '2026-04-15',
                    totalStaffCount: 8,
                    status: 'DRAFT',
                    totalGrossPay: 120000,
                    totalNetPay: 115000
                }
            });
        });

        await page.goto('/canteen/payroll');

        // Assert empty state
        await expect(page.locator('text=Payroll Management')).toBeVisible();
        await expect(page.locator('text=No payrolls yet')).toBeVisible();

        // UI Automation Series: Open modal and enter payload
        await page.click('button:has-text("+ Generate Payroll")');
        await expect(page.locator('h2:has-text("Generate Payroll")')).toBeVisible();

        // Select dates and invoke server submit
        await page.fill('input[type="date"] >> nth=0', '2026-04-01');
        await page.fill('input[type="date"] >> nth=1', '2026-04-15');
        await page.getByRole('button', { name: 'Generate', exact: true }).click();

        // Verify successful card rendering of the DRAFT
        await expect(page.locator('text=2026-04-01 — 2026-04-15')).toBeVisible();
        await expect(page.locator('text=📝 Draft')).toBeVisible();
        await expect(page.locator('text=Rs.115,000')).toBeVisible();
        await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible();
    });
});
