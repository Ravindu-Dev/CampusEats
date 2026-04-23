import { test, expect } from '@playwright/test';

test.describe('User Management System', () => {

    // ─── SIGNUP FLOW TESTS ─────────────────────────────────────────────

    test('should render the signup form with multi-step wizard (Personal → Account → Contact)', async ({ page }) => {
        await page.goto('/signup');

        // Step 1 — Personal info should be visible
        await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
        await expect(page.locator('text=Step')).toBeVisible();
        await expect(page.locator('span.text-orange-400:has-text("Personal")')).toBeVisible();

        // First and Last Name inputs are visible on step 1
        await expect(page.locator('input[name="firstName"]')).toBeVisible();
        await expect(page.locator('input[name="lastName"]')).toBeVisible();
    });

    test('should validate that first and last names are required before proceeding to step 2', async ({ page }) => {
        await page.goto('/signup');

        // Try to proceed without filling anything
        await page.click('button:has-text("Continue")');

        // Should show validation error
        await expect(page.locator('text=Please fill in your first and last name')).toBeVisible();

        // Step should still be 1
        await expect(page.locator('input[name="firstName"]')).toBeVisible();
    });

    test('should reject first/last names containing numbers or special characters', async ({ page }) => {
        await page.goto('/signup');

        // Fill in invalid first name with numbers
        await page.fill('input[name="firstName"]', 'John123');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        await expect(page.locator('text=First name can only contain letters')).toBeVisible();

        // Now fix first name but break last name
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe@');
        await page.click('button:has-text("Continue")');

        await expect(page.locator('text=Last name can only contain letters')).toBeVisible();
    });

    test('should navigate to step 2 (Account) after valid personal info', async ({ page }) => {
        await page.goto('/signup');

        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Should now be on step 2 with Account fields
        await expect(page.locator('span.text-orange-400:has-text("Account")')).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('should validate email format (must contain @) on step 2', async ({ page }) => {
        await page.goto('/signup');

        // Step 1
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Step 2 — invalid email
        await page.fill('input[name="username"]', 'johndoe');
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Continue")');

        await expect(page.locator('text=Please enter a valid email address with @ symbol')).toBeVisible();
    });

    test('should display password strength checklist and enforce all requirements', async ({ page }) => {
        await page.goto('/signup');

        // Navigate to step 2
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Check that checklist items are rendered
        await expect(page.locator('text=8+ Characters')).toBeVisible();
        await expect(page.locator('text=Upper Case')).toBeVisible();
        await expect(page.locator('text=Lower Case')).toBeVisible();
        await expect(page.locator('text=Numbers')).toBeVisible();
        await expect(page.locator('text=Special Char')).toBeVisible();

        // Enter a weak password that fails all checks
        await page.fill('input[name="username"]', 'johndoe');
        await page.fill('input[name="email"]', 'john@test.com');
        await page.fill('input[name="password"]', 'short');
        await page.click('button:has-text("Continue")');

        await expect(page.locator('text=Password does not meet all requirements')).toBeVisible();
    });

    test('should navigate to step 3 (Contact) after valid account info', async ({ page }) => {
        await page.goto('/signup');

        // Step 1
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Step 2
        await page.fill('input[name="username"]', 'johndoe');
        await page.fill('input[name="email"]', 'john@university.edu');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Continue")');

        // Should now be on step 3 with Contact fields
        await expect(page.locator('span.text-orange-400:has-text("Contact")')).toBeVisible();
        await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
        await expect(page.locator('input[name="address"]')).toBeVisible();

        // Create Account button should now be visible
        await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
    });

    test('should allow navigating back between signup wizard steps', async ({ page }) => {
        await page.goto('/signup');

        // Go to step 2
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Verify we are on step 2
        await expect(page.locator('input[name="username"]')).toBeVisible();

        // Go back to step 1
        await page.click('button:has-text("Back")');

        // Should see step 1 fields again with preserved values
        await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
        await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
    });

    test('should submit signup and redirect to login on success', async ({ page }) => {
        // Mock the signup API
        await page.route('**/api/auth/signup', async route => {
            await route.fulfill({
                status: 201,
                body: 'User registered successfully!'
            });
        });

        await page.goto('/signup');

        // Step 1
        await page.fill('input[name="firstName"]', 'Jane');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Step 2
        await page.fill('input[name="username"]', 'janedoe');
        await page.fill('input[name="email"]', 'jane@university.edu');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Continue")');

        // Step 3
        await page.fill('input[name="phoneNumber"]', '0771234567');
        await page.fill('input[name="address"]', 'Block A, Room 201');
        await page.click('button:has-text("Create Account")');

        // Should redirect to login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should show error message when signup fails (duplicate username)', async ({ page }) => {
        // Mock signup API returning error
        await page.route('**/api/auth/signup', async route => {
            await route.fulfill({
                status: 400,
                body: 'Error: Username is already taken!'
            });
        });

        await page.goto('/signup');

        // Step 1
        await page.fill('input[name="firstName"]', 'Jane');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.click('button:has-text("Continue")');

        // Step 2
        await page.fill('input[name="username"]', 'existinguser');
        await page.fill('input[name="email"]', 'jane@university.edu');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Continue")');

        // Step 3
        await page.click('button:has-text("Create Account")');

        // Should display the error
        await expect(page.locator('text=Username is already taken')).toBeVisible();
    });

    // ─── LOGIN FLOW TESTS ──────────────────────────────────────────────

    test('should render the login form with username and password fields', async ({ page }) => {
        await page.goto('/login');

        await expect(page.locator('h2:has-text("Welcome back")')).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test('should toggle password visibility when the eye icon is clicked', async ({ page }) => {
        await page.goto('/login');

        const passwordInput = page.locator('input[name="password"]');
        await page.fill('input[name="password"]', 'testpassword');

        // Initially password should be hidden
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click the visibility toggle button (it's the button inside the password field div)
        const toggleButton = page.locator('input[name="password"]').locator('..').locator('button');
        await toggleButton.click();

        // Now should be visible
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should login successfully and redirect to homepage', async ({ page }) => {
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

        // Mock FCM setup (prevent real Firebase calls)
        await page.route('**/api/fcm/**', async route => {
            await route.fulfill({ status: 200, json: { message: 'ok' } });
        });

        await page.goto('/login');

        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'StrongP@ss1');
        await page.click('button:has-text("Sign In")');

        // Should redirect to homepage
        await expect(page).toHaveURL('/');
    });

    test('should show error message on login failure (invalid credentials)', async ({ page }) => {
        // Mock failed login
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 401,
                json: { message: 'Invalid username or password' }
            });
        });

        await page.goto('/login');

        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button:has-text("Sign In")');

        // Error message should appear
        await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('should have navigation links to signup and canteen owner login', async ({ page }) => {
        await page.goto('/login');

        // Sign up link
        const signupLink = page.locator('a:has-text("Sign up free")');
        await expect(signupLink).toBeVisible();
        await expect(signupLink).toHaveAttribute('href', '/signup');

        // Canteen owner login link
        const canteenLink = page.locator('a:has-text("Login here")');
        await expect(canteenLink).toBeVisible();
        await expect(canteenLink).toHaveAttribute('href', '/canteen/login');
    });

    // ─── USER PROFILE MANAGEMENT TESTS ─────────────────────────────────

    test('should display user profile information correctly', async ({ page }) => {
        // Mock logged-in user
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'ravindu',
                email: 'ravindu@uni.edu',
                firstName: 'Ravindu',
                phoneNumber: '0771234567',
                profilePhotoUrl: null,
                createdAt: '2025-03-15T10:30:00'
            }));
        });

        // Mock profile API
        await page.route('**/api/user/profile', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: {
                        id: 'user-001',
                        username: 'ravindu',
                        firstName: 'Ravindu',
                        lastName: 'Devindi',
                        email: 'ravindu@uni.edu',
                        phoneNumber: '0771234567',
                        address: 'Block C, Room 305',
                        profilePhotoUrl: null,
                        createdAt: '2025-03-15T10:30:00'
                    }
                });
            } else {
                await route.fulfill({ status: 200, json: {} });
            }
        });

        // Mock orders & reviews APIs (empty)
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/profile');

        // Profile info should be displayed
        await expect(page.locator('h1:has-text("My Account")')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Ravindu' })).toBeVisible();
        await expect(page.locator('p:has-text("ravindu@uni.edu")')).toBeVisible();
    });

    test('should allow editing profile fields (firstName, lastName, phone, address)', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'ravindu',
                email: 'ravindu@uni.edu',
                firstName: 'Ravindu'
            }));
        });

        await page.route('**/api/user/profile', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: {
                        id: 'user-001',
                        username: 'ravindu',
                        firstName: 'Ravindu',
                        lastName: 'Devindi',
                        email: 'ravindu@uni.edu',
                        phoneNumber: '0771234567',
                        address: 'Block C',
                        profilePhotoUrl: null,
                        createdAt: '2025-03-15T10:30:00'
                    }
                });
            } else if (route.request().method() === 'PUT') {
                const body = route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    json: {
                        id: 'user-001',
                        username: 'ravindu',
                        firstName: body.firstName || 'Ravindu',
                        lastName: body.lastName || 'Devindi',
                        email: 'ravindu@uni.edu',
                        phoneNumber: body.phoneNumber || '0771234567',
                        address: body.address || 'Block C',
                        profilePhotoUrl: null,
                        createdAt: '2025-03-15T10:30:00'
                    }
                });
            }
        });

        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/profile');

        // Click Edit Profile button
        await page.click('button:has-text("Edit Profile")');

        // Fields should now be editable — clear and re-fill first name
        const firstNameInput = page.locator('input[type="text"]').filter({ hasText: '' }).first();
        await page.locator('form input[type="text"]').first().fill('Kavindu');

        // Click Update Profile
        await page.click('button:has-text("Update Profile")');

        // Success message should appear
        await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    test('should validate profile form fields (first name min length, phone 10 digits)', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'ravindu',
                email: 'ravindu@uni.edu',
                firstName: 'Ravindu'
            }));
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001',
                    username: 'ravindu',
                    firstName: 'Ravindu',
                    lastName: 'Devindi',
                    email: 'ravindu@uni.edu',
                    phoneNumber: '0771234567',
                    address: 'Block C, Room 305',
                    profilePhotoUrl: null,
                    createdAt: '2025-03-15T10:30:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/profile');

        // Enable editing
        await page.click('button:has-text("Edit Profile")');

        // Clear first name and set to single character (too short)
        await page.locator('form input[type="text"]').first().fill('R');

        // Set invalid phone number (not 10 digits)
        const phoneInput = page.locator('input[type="tel"]');
        await phoneInput.fill('123');

        await page.click('button:has-text("Update Profile")');

        // Validation errors should appear
        await expect(page.locator('text=First name must be at least 2 characters')).toBeVisible();
        await expect(page.locator('text=Phone number must be exactly 10 digits')).toBeVisible();
    });

    test('should display profile completion progress bar', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'ravindu',
                email: 'ravindu@uni.edu',
                firstName: 'Ravindu'
            }));
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001',
                    username: 'ravindu',
                    firstName: 'Ravindu',
                    lastName: 'Devindi',
                    email: 'ravindu@uni.edu',
                    phoneNumber: null,
                    address: null,
                    profilePhotoUrl: null,
                    createdAt: '2025-03-15T10:30:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });

        await page.goto('/profile');

        // Profile completion section should be visible
        await expect(page.locator('text=Profile Completion')).toBeVisible();

        // Should show less than 100% since phone, address, profilePhoto are missing
        await expect(page.locator('text=Complete your profile to unlock all features')).toBeVisible();
    });

    test('should logout user and redirect to login page', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'testuser',
                email: 'test@uni.edu',
                firstName: 'Test'
            }));
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@uni.edu',
                    phoneNumber: '0771234567',
                    address: 'Block A',
                    profilePhotoUrl: null,
                    createdAt: '2025-01-01T00:00:00'
                }
            });
        });
        await page.route('**/api/orders', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({ status: 200, json: [] });
        });
        await page.route('**/api/fcm/**', async route => {
            await route.fulfill({ status: 200, json: { message: 'ok' } });
        });

        await page.goto('/profile');

        // Click Logout button
        await page.click('button:has-text("Logout")');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);
    });

    test('should display quick stats (total orders, completed, reviews, in progress)', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('user', JSON.stringify({
                token: 'mock-jwt-token',
                username: 'ravindu',
                email: 'ravindu@uni.edu',
                firstName: 'Ravindu'
            }));
        });

        await page.route('**/api/user/profile', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'user-001', username: 'ravindu', firstName: 'Ravindu', lastName: 'Dev',
                    email: 'ravindu@uni.edu', phoneNumber: '0771234567', address: 'Block C',
                    profilePhotoUrl: null, createdAt: '2025-03-15T10:30:00'
                }
            });
        });

        await page.route('**/api/orders', async route => {
            await route.fulfill({
                status: 200,
                json: [
                    { id: 'ORD-1', orderStatus: 'COMPLETED', paymentStatus: 'succeeded', totalAmount: 500, createdAt: new Date().toISOString(), orderItems: [] },
                    { id: 'ORD-2', orderStatus: 'PREPARING', paymentStatus: 'succeeded', totalAmount: 800, createdAt: new Date().toISOString(), orderItems: [] },
                    { id: 'ORD-3', orderStatus: 'COMPLETED', paymentStatus: 'succeeded', totalAmount: 350, createdAt: new Date().toISOString(), orderItems: [] }
                ]
            });
        });

        await page.route('**/api/reviews/my', async route => {
            await route.fulfill({
                status: 200,
                json: [
                    { id: 'REV-1', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() }
                ]
            });
        });

        await page.goto('/profile');

        // Quick Stats section should be visible
        await expect(page.locator('text=Quick Stats')).toBeVisible();
        await expect(page.locator('text=Total Orders')).toBeVisible();
        await expect(page.locator('text=Completed')).toBeVisible();
        await expect(page.getByRole('main').getByText('Reviews')).toBeVisible();
        await expect(page.locator('text=In Progress')).toBeVisible();
    });

});
