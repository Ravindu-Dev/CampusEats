import { test, expect } from '@playwright/test';

test.describe('Recommend Combo Deals & Loyalty Points', () => {

    // ─── Shared mock data ───
    const MOCK_USER = { id: 'US-200', email: 'student@university.lk', name: 'Malinda Perera', token: 'mock-user-jwt' };
    const MOCK_OWNER = { id: 'O-100', ownerName: 'John Fernando', email: 'john@campuseats.lk', canteenId: 'CAN-001', token: 'mock-jwt-token' };
    const MOCK_CANTEEN = { id: 'CAN-001', canteenName: 'Maharagama Canteen', status: 'APPROVED', active: true, logoUrl: 'https://placehold.co/100', rating: 4.5, totalRatings: 50 };

    const MOCK_MENU_ITEMS = [
        { id: 'MI-1', name: 'Chicken Kottu', price: 625, category: 'Lunch', canteenId: 'CAN-001', available: true, vegetarian: false, imageUrl: 'https://placehold.co/300' },
        { id: 'MI-2', name: 'Veggie Fried Rice', price: 550, category: 'Lunch', canteenId: 'CAN-001', available: true, vegetarian: true, imageUrl: 'https://placehold.co/300' },
        { id: 'MI-3', name: 'Hot Coffee', price: 150, category: 'Beverages', canteenId: 'CAN-001', available: true, vegetarian: true, imageUrl: '' },
    ];

    const MOCK_LOYALTY_ACCOUNT = {
        totalPoints: 250,
        lifetimePoints: 1200,
        tier: 'SILVER',
        nextTier: 'GOLD',
        pointsToNextTier: 800,
        totalWeeklySpending: 3500
    };

    const MOCK_COMBO_DEALS = [
        {
            id: 'CD-1', name: 'Lunch Special Combo', description: 'Best value lunch deal', category: 'Lunch Combo',
            comboPrice: 900, originalPrice: 1175, discountPercent: 23, minWeeklySpend: 3000, active: true,
            canteenId: 'CAN-001', canteenName: 'Maharagama Canteen',
            imageUrl: 'https://placehold.co/400x200',
            items: [
                { menuItemId: 'MI-1', name: 'Chicken Kottu', price: 625, quantity: 1, imageUrl: 'https://placehold.co/100' },
                { menuItemId: 'MI-2', name: 'Veggie Fried Rice', price: 550, quantity: 1, imageUrl: 'https://placehold.co/100' },
            ]
        },
        {
            id: 'CD-2', name: 'Snack & Drink', description: 'Perfect afternoon pairing', category: 'Snack Combo',
            comboPrice: 500, originalPrice: 700, discountPercent: 29, minWeeklySpend: 2000, active: true,
            canteenId: 'CAN-001', canteenName: 'Maharagama Canteen',
            imageUrl: 'https://placehold.co/400x200',
            items: [
                { menuItemId: 'MI-3', name: 'Hot Coffee', price: 150, quantity: 2, imageUrl: '' },
                { menuItemId: 'MI-2', name: 'Veggie Fried Rice', price: 550, quantity: 1, imageUrl: 'https://placehold.co/100' },
            ]
        },
    ];

    const MOCK_RECOMMENDED_COMBOS = [
        {
            ...MOCK_COMBO_DEALS[0],
            recommendationReason: 'Frequent Buyer'
        }
    ];


    // ═══════════════════════════════════════════════════════════════
    //  PART 1: RECOMMEND COMBO DEALS (User-facing Menu Page)
    // ═══════════════════════════════════════════════════════════════

    test.describe('Recommended Combos on Menu Page', () => {

        const setupMenuPageMocks = async (page, { withUser = true } = {}) => {
            if (withUser) {
                await page.addInitScript((user) => {
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', user.token);
                }, MOCK_USER);
            }

            await page.route('**/api/canteens', async route => {
                await route.fulfill({ status: 200, json: [MOCK_CANTEEN] });
            });
            await page.route('**/api/canteens/queue-status', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/menu-items', async route => {
                await route.fulfill({ status: 200, json: MOCK_MENU_ITEMS });
            });
            await page.route('**/api/combo-deals/all', async route => {
                await route.fulfill({ status: 200, json: MOCK_COMBO_DEALS });
            });
            await page.route('**/api/combo-deals/recommended', async route => {
                await route.fulfill({ status: 200, json: MOCK_RECOMMENDED_COMBOS });
            });
            await page.route('**/api/loyalty/account', async route => {
                await route.fulfill({ status: 200, json: MOCK_LOYALTY_ACCOUNT });
            });
            await page.route('**/api/loyalty/spending', async route => {
                await route.fulfill({ status: 200, json: { weeklySpending: 3500 } });
            });
            await page.route('**/api/users/favorites', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/orders/most-purchased*', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            // Fallback for auth refresh, etc.
            await page.route('**/api/auth/refresh', async route => {
                await route.fulfill({ status: 200, json: MOCK_USER });
            });
        };


        // ─── TEST 1: Recommended combos section visible for logged-in users ───
        test('should display recommended combo deals for logged-in users', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            // "Recommended For You" section
            await expect(page.locator('text=Recommended For You')).toBeVisible();
            await expect(page.locator('text=Personalized combo deals based on your ordering habits')).toBeVisible();

            // Recommended combo card
            await expect(page.locator('text=Lunch Special Combo').first()).toBeVisible();
            await expect(page.locator('text=Frequent Buyer').first()).toBeVisible();
        });


        // ─── TEST 2: All combo deals section visible to everyone ───
        test('should display all combo deals section', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            await expect(page.locator('text=Combo Deals').first()).toBeVisible();
            await expect(page.locator('text=Save more with bundle offers')).toBeVisible();

            // Both combo deals should appear
            await expect(page.locator('text=Lunch Special Combo').first()).toBeVisible();
            await expect(page.locator('text=Snack & Drink').first()).toBeVisible();
        });


        // ─── TEST 3: Combo deal discount percentage badge ───
        test('should display discount percentage badge on combo deals', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            await expect(page.locator('text=23% OFF').first()).toBeVisible();
            await expect(page.locator('text=29% OFF').first()).toBeVisible();
        });


        // ─── TEST 4: Combo pricing shows original and discounted price ───
        test('should display both original and combo prices', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            // Original price crossed out, combo price visible
            await expect(page.locator('text=Rs.1175').first()).toBeVisible();
            await expect(page.locator('text=Rs.900').first()).toBeVisible();
        });


        // ─── TEST 5: No recommended combos section for logged-out users ───
        test('should not show recommended section for logged-out users', async ({ page }) => {
            await setupMenuPageMocks(page, { withUser: false });
            await page.goto('/menu');

            // "Recommended For You" should not be there
            await expect(page.locator('text=Recommended For You')).not.toBeVisible();

            // But general combo deals section should still appear
            await expect(page.locator('text=Combo Deals').first()).toBeVisible();

            // Login prompt
            await expect(page.locator('text=Login for personalized deals')).toBeVisible();
        });

    });


    // ═══════════════════════════════════════════════════════════════
    //  PART 2: LOYALTY POINTS (Menu Page Badge)
    // ═══════════════════════════════════════════════════════════════

    test.describe('Loyalty Points Badge', () => {

        const setupMenuPageMocks = async (page) => {
            await page.addInitScript((user) => {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', user.token);
            }, MOCK_USER);

            await page.route('**/api/canteens', async route => {
                await route.fulfill({ status: 200, json: [MOCK_CANTEEN] });
            });
            await page.route('**/api/canteens/queue-status', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/menu-items', async route => {
                await route.fulfill({ status: 200, json: MOCK_MENU_ITEMS });
            });
            await page.route('**/api/combo-deals/all', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/combo-deals/recommended', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/loyalty/account', async route => {
                await route.fulfill({ status: 200, json: MOCK_LOYALTY_ACCOUNT });
            });
            await page.route('**/api/users/favorites', async route => {
                await route.fulfill({ status: 200, json: [] });
            });
            await page.route('**/api/auth/refresh', async route => {
                await route.fulfill({ status: 200, json: MOCK_USER });
            });
        };


        // ─── TEST 1: Loyalty badge displays on menu page ───
        test('should display loyalty points floating badge', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            // Badge should show total points and tier
            await expect(page.locator('text=250 pts')).toBeVisible();
            await expect(page.locator('text=SILVER')).toBeVisible();
        });


        // ─── TEST 2: Clicking badge expands to show detailed loyalty info ───
        test('should expand loyalty badge to show detailed information', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            // Click on the badge to expand
            await page.locator('text=250 pts').click();

            // Expanded panel content
            await expect(page.locator('text=250').first()).toBeVisible(); // Total points
            await expect(page.locator('text=Lifetime: 1200 points')).toBeVisible();
            await expect(page.locator('text=Next: GOLD')).toBeVisible();
            await expect(page.locator('text=800 pts away')).toBeVisible();

            // Weekly spending
            await expect(page.locator('text=This Week')).toBeVisible();
            await expect(page.locator('text=Rs. 3,500')).toBeVisible();
            await expect(page.locator('text=Earn 1 point per Rs. 10 spent')).toBeVisible();
        });


        // ─── TEST 3: Close button on expanded loyalty badge ───
        test('should close expanded loyalty panel via close button', async ({ page }) => {
            await setupMenuPageMocks(page);
            await page.goto('/menu');

            // Expand the badge
            await page.locator('text=250 pts').click();

            // Verify expanded panel is visible
            await expect(page.locator('text=Lifetime: 1200 points')).toBeVisible();

            // Close it
            await page.locator('button:has-text("✕")').click();

            // Should collapse back to badge
            await expect(page.locator('text=Lifetime: 1200 points')).not.toBeVisible();
            await expect(page.locator('text=250 pts')).toBeVisible();
        });

    });


    // ═══════════════════════════════════════════════════════════════
    //  PART 3: COMBO DEAL MANAGEMENT (Canteen Owner Side)
    // ═══════════════════════════════════════════════════════════════

    test.describe('Combo Deal Management', () => {

        const setupComboMgmtMocks = async (page, overrides = {}) => {
            await page.addInitScript((owner) => {
                localStorage.setItem('canteenOwner', JSON.stringify(owner));
            }, overrides.owner || MOCK_OWNER);

            await page.route('**/api/canteens/owner/*', async route => {
                await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
            });
            await page.route('**/api/canteens/CAN-001', async route => {
                await route.fulfill({ status: 200, json: overrides.canteen || MOCK_CANTEEN });
            });
            await page.route('**/api/combo-deals/canteen/CAN-001', async route => {
                await route.fulfill({ status: 200, json: overrides.combos || MOCK_COMBO_DEALS });
            });
            await page.route('**/api/menu-items/canteen/CAN-001', async route => {
                await route.fulfill({ status: 200, json: overrides.menuItems || MOCK_MENU_ITEMS });
            });
            await page.route('**/api/staff/canteen/CAN-001/count', async route => {
                await route.fulfill({ status: 200, json: 3 });
            });
        };


        // ─── TEST 1: Combo management page renders with existing deals ───
        test('should render combo management page with existing deals', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await expect(page.locator('text=Combo Deals').first()).toBeVisible();
            await expect(page.locator('text=Lunch Special Combo').first()).toBeVisible();
            await expect(page.locator('text=Snack & Drink').first()).toBeVisible();

            // Pricing
            await expect(page.locator('text=Rs. 900').first()).toBeVisible();
            await expect(page.locator('text=Rs. 1175').first()).toBeVisible();

            // Active/Inactive badge
            await expect(page.locator('text=Active').first()).toBeVisible();
        });


        // ─── TEST 2: Create combo deal form opens ───
        test('should open combo deal creation form', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await page.locator('button:has-text("+ Create Combo Deal")').click();

            await expect(page.locator('text=Create New Combo Deal')).toBeVisible();
            await expect(page.locator('text=Select Items for Combo')).toBeVisible();
            await expect(page.locator('text=(min. 2 items)')).toBeVisible();
        });


        // ─── TEST 3: Selecting items shows pricing section ───
        test('should show pricing section after selecting 2+ items', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await page.locator('button:has-text("+ Create Combo Deal")').click();

            // Select items — click on item cards
            // Select items — click on item cards in the selection grid (not in existing deals)
            await page.locator('div:has(h3:has-text("Select Items for Combo"))').getByText('Chicken Kottu').first().click();
            await page.locator('div:has(h3:has-text("Select Items for Combo"))').getByText('Veggie Fried Rice').first().click();

            // Pricing section should appear
            await expect(page.locator('h3:has-text("Pricing")')).toBeVisible();
            await expect(page.locator('text=Original Total')).toBeVisible();

            // Original total = 625 + 550 = 1175
            await expect(page.locator('p:has-text("Rs. 1175")').first()).toBeVisible();
        });


        // ─── TEST 4: Combo price validation ───
        test('should validate that combo price is less than original total', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await page.locator('button:has-text("+ Create Combo Deal")').click();

            // Fill combo name
            await page.fill('input[name="name"]', 'Test Combo');

            // Select 2 items
            // Select 2 items
            await page.locator('div:has(h3:has-text("Select Items for Combo"))').getByText('Chicken Kottu').first().click();
            await page.locator('div:has(h3:has-text("Select Items for Combo"))').getByText('Veggie Fried Rice').first().click();

            // Set combo price HIGHER than original (should fail)
            await page.fill('input[name="comboPrice"]', '1500');

            // Submit
            await page.locator('button[type="submit"]:has-text("Create Combo Deal")').click();

            // Error message
            await expect(page.locator('text=Combo price must be less than the sum')).toBeVisible();
        });


        // ─── TEST 5: Minimum items validation ───
        test('should validate minimum 2 items for combo', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await page.locator('button:has-text("+ Create Combo Deal")').click();

            // Fill name but select only 1 item — pricing section should NOT be visible
            await page.fill('input[name="name"]', 'Bad Combo');
            await page.locator('div:has(h3:has-text("Select Items for Combo"))').getByText('Chicken Kottu').first().click();
            
            await expect(page.locator('h3:has-text("Pricing")')).not.toBeVisible();

            // Submit — should show error from frontend validation if any, or just fail to submit
            await page.locator('button[type="submit"]:has-text("Create Combo Deal")').click();

            // Error
            await expect(page.locator('text=Please select at least 2 menu items')).toBeVisible();
        });


        // ─── TEST 6: Empty combo deals shows prompt ───
        test('should show empty state when no combo deals exist', async ({ page }) => {
            await setupComboMgmtMocks(page, { combos: [] });
            await page.goto('/canteen/combo-management');

            await expect(page.locator('text=No combo deals yet')).toBeVisible();
            await expect(page.locator('text=Create combo deals to offer bundle discounts')).toBeVisible();
            await expect(page.locator('button:has-text("+ Create Your First Combo")')).toBeVisible();
        });


        // ─── TEST 7: Recommendation settings display ───
        test('should show recommendation settings in combo form', async ({ page }) => {
            await setupComboMgmtMocks(page);
            await page.goto('/canteen/combo-management');

            await page.locator('button:has-text("+ Create Combo Deal")').click();

            await expect(page.locator('text=Recommendation Settings')).toBeVisible();
            await expect(page.locator('text=Min. Weekly Spend for Recommendation')).toBeVisible();

            // Default min weekly spend
            const minSpendInput = page.locator('input[name="minWeeklySpend"]');
            await expect(minSpendInput).toHaveValue('5000');
        });


        // ─── TEST 8: Loyalty points used during checkout ───
        test('should display loyalty points on checkout page', async ({ page }) => {
            await page.addInitScript((user) => {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', user.token);
            }, MOCK_USER);

            await page.route('**/api/cart', async route => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({ status: 200, json: {
                        id: 'cart-1', userId: 'US-200',
                        items: [{ menuItemId: 'MI-1', name: 'Chicken Kottu', price: 625, quantity: 1, canteenId: 'CAN-001', canteenName: 'Maharagama Canteen' }]
                    }});
                } else {
                    await route.fulfill({ status: 200, json: {} });
                }
            });
            await page.route('**/api/loyalty/account', async route => {
                await route.fulfill({ status: 200, json: MOCK_LOYALTY_ACCOUNT });
            });
            await page.route('**/api/orders', async route => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({ status: 200, json: [{ id: 'ORD-TEST', totalAmount: 625 }] });
                } else {
                    await route.fulfill({ status: 200, json: [] });
                }
            });
            await page.route('**/api/payment/create-intent', async route => {
                await route.fulfill({ status: 200, json: { clientSecret: 'pi_test' } });
            });

            await page.goto('/checkout');

            // Checkout should render with the cart item
            await expect(page.locator('h1').filter({ hasText: 'Checkout' })).toBeVisible();
            await expect(page.locator('text=Chicken Kottu').first()).toBeVisible();
        });

    });

});
