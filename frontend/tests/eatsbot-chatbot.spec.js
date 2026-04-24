// @ts-check
import { test, expect } from '@playwright/test';

/*
 * ============================================================
 *  EATSBOT CHATBOT — E2E Tests (Playwright)
 * ============================================================
 *  Component Owner : Ravindu
 *  Covers          : Chatbot.jsx (frontend)
 *                    chatbotService.js (frontend)
 *                    ChatbotService.java, ChatbotController.java (backend)
 *
 *  User Journeys Tested:
 *    1. Chatbot toggle button appears on the page
 *    2. Chatbot window opens/closes with animation
 *    3. Welcome message is displayed on first open
 *    4. Quick suggestion chips are visible
 *    5. User can type and send a message
 *    6. Bot responds with formatted reply (menu items)
 *    7. Chatbot handles dietary queries (vegetarian/vegan)
 *    8. Chatbot handles combo deals query
 *    9. Chatbot handles canteen hours query
 *   10. Clear chat functionality works
 *   11. Error handling and retry mechanism
 *   12. Chat input is disabled while bot is typing
 *   13. Chatbot handles empty message gracefully
 *   14. Chatbot handles budget/price queries
 *   15. Chatbot handles queue/wait time queries
 * ============================================================
 */

// ── Mock Data ──────────────────────────────────────────────────

const MOCK_MENU_RESPONSE = {
    reply: "🍽️ Here are some available items:\n\n" +
        "- 🔴 **Chicken Rice** — Rs. 750\n" +
        "- 🔴 **Beef Burger** — Rs. 650\n" +
        "- 🟢 **Vegetable Fried Rice** — Rs. 500\n" +
        "- 🟢 **Fresh Fruit Salad** — Rs. 350\n",
    data: [],
};

const MOCK_VEG_RESPONSE = {
    reply: "🥗 Here are the **vegetarian/vegan** options:\n\n" +
        "- 🟢 **Vegetable Fried Rice** — Rs. 500 (Lunch)\n" +
        "- 🟢 **Fresh Fruit Salad** — Rs. 350 (Snacks)\n" +
        "- 🟢 **Cheese Sandwich** — Rs. 280 (Breakfast)\n",
    data: [],
};

const MOCK_DEALS_RESPONSE = {
    reply: "🎁 **Active Combo Deals:**\n\n" +
        "- 🔥 **Student Lunch Combo** — Rice + Curry + Drink\n" +
        "   ~~Rs. 900~~ → **Rs. 750** (17% off!)\n\n" +
        "- 🔥 **Breakfast Bundle** — Toast + Egg + Tea\n" +
        "   ~~Rs. 450~~ → **Rs. 350** (22% off!)\n",
    data: [],
};

const MOCK_HOURS_RESPONSE = {
    reply: "🕐 **Canteen Hours:**\n\n" +
        "- 🏪 **Main Campus Canteen**\n" +
        "   ⏰ 07:30 – 20:00\n" +
        "   📅 Monday, Tuesday, Wednesday, Thursday, Friday\n" +
        "   📍 Building A, Ground Floor\n",
    data: [],
};

const MOCK_BUDGET_RESPONSE = {
    reply: "💰 Items under **Rs. 200**:\n\n" +
        "- 🟢 **Plain Tea** — Rs. 50\n" +
        "- 🟢 **Milk Coffee** — Rs. 80\n" +
        "- 🔴 **Fish Roll** — Rs. 120\n" +
        "- 🟢 **Wade** — Rs. 60\n",
    data: [],
};

const MOCK_QUEUE_RESPONSE = {
    reply: "⏱️ Live wait status:\n\n" +
        "- 🟢 **Main Campus Canteen** — 2 pending\n" +
        "- 🟡 **Engineering Block Cafe** — 8 pending\n" +
        "- 🔴 **Science Faculty Kiosk** — 15 pending\n",
    data: [],
};

const MOCK_GREETING_RESPONSE = {
    reply: "Hey there! 🍔 I'm Eatsbot, your CampusEats assistant! I can help you with:\n\n" +
        "🍽️ **Menu** — What's available to eat\n" +
        "🥗 **Dietary options** — Veg, vegan, halal filters\n" +
        "⏱️ **Wait times** — Which canteen is least busy\n" +
        "💰 **Deals** — Active combo deals & offers\n" +
        "🕐 **Hours** — Canteen timings\n\n" +
        "Just ask me anything!",
    data: [],
};

const MOCK_ERROR_RESPONSE = {
    reply: "Oops! Something went wrong. Please try again! 🍔",
    data: [],
};

// ── Helper: Mock chatbot API based on message content ────────

async function mockChatbotAPI(page) {
    await page.route('**/api/chatbot/query', async (route, request) => {
        const body = JSON.parse(request.postData() || '{}');
        const msg = (body.message || '').toLowerCase();

        let response;

        if (msg.includes('menu') || msg.includes('food') || msg.includes('today')) {
            response = MOCK_MENU_RESPONSE;
        } else if (msg.includes('veg') || msg.includes('vegan') || msg.includes('vegetarian')) {
            response = MOCK_VEG_RESPONSE;
        } else if (msg.includes('deal') || msg.includes('combo') || msg.includes('offer')) {
            response = MOCK_DEALS_RESPONSE;
        } else if (msg.includes('hour') || msg.includes('time') || msg.includes('open') || msg.includes('close')) {
            response = MOCK_HOURS_RESPONSE;
        } else if (msg.includes('budget') || msg.includes('cheap') || msg.includes('under') || msg.includes('price')) {
            response = MOCK_BUDGET_RESPONSE;
        } else if (msg.includes('busy') || msg.includes('wait') || msg.includes('queue')) {
            response = MOCK_QUEUE_RESPONSE;
        } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
            response = MOCK_GREETING_RESPONSE;
        } else {
            response = {
                reply: "🤔 I'm not sure I understood that. Try asking about:\n\n• **Menu** / food items\n• **Vegan** / vegetarian options\n• **Combo deals** & offers\n• Items under a **budget**\n• Canteen **hours**\n\nOr type **help**! 🍔",
                data: [],
            };
        }

        // Simulate slight delay (realistic API response time)
        await new Promise((resolve) => setTimeout(resolve, 300));

        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
        });
    });
}

// ══════════════════════════════════════════════════════════════
//  TEST SUITE: Eatsbot Chatbot
// ══════════════════════════════════════════════════════════════

test.describe('Eatsbot Chatbot — AI Campus Food Assistant', () => {

    test.beforeEach(async ({ page }) => {
        await mockChatbotAPI(page);
    });

    // ── TEST 1: Toggle button visible on homepage ───────────

    test('TC-BOT-01: Chatbot toggle button is visible on the page', async ({ page }) => {
        await page.goto('/');
        
        // Use more specific locator for the toggle button
        const toggleBtn = page.locator('#chatbot-toggle');
        await expect(toggleBtn).toBeVisible();
    });

    // ── TEST 2: Chatbot window opens on click ───────────────

    test('TC-BOT-02: Clicking toggle button opens the chatbot window', async ({ page }) => {
        await page.goto('/');

        // Click toggle button (ensure it's the first one if multiple exist)
        await page.locator('#chatbot-toggle').first().click();

        // Chatbot window should appear
        const chatWindow = page.locator('#chatbot-window');
        await expect(chatWindow).toBeVisible();

        // Header should show "Eatsbot"
        await expect(page.getByText('Eatsbot').first()).toBeVisible();
    });

    // ── TEST 3: Welcome message displayed ───────────────────

    test('TC-BOT-03: Welcome message is displayed when chatbot opens', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Welcome message content - using regex for robustness
        await expect(page.getByText(/Hello! 👋 I'm/i).first()).toBeVisible();
        await expect(page.getByText(/Today's menu & prices/i).first()).toBeVisible();
    });

    // ── TEST 4: Quick suggestion chips visible ──────────────

    test('TC-BOT-04: Quick suggestion chips are displayed initially', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Suggestion buttons should be visible
        await expect(page.getByRole('button', { name: /Menu today/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Vegan options/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Combo deals/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Items under 200/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Canteen hours/i }).first()).toBeVisible();
    });

    // ── TEST 5: User can type and send a message ────────────

    test('TC-BOT-05: User can type a message and receive a bot response', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Type a message
        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Show me the menu');

        // Click send button
        await page.locator('.chatbot-send').first().click();

        // User message should appear in the chat history
        // (Using .last() in case the input field still has the text or multiple messages)
        await expect(page.getByText('Show me the menu').last()).toBeVisible();

        // Wait for bot response
        await expect(page.getByText(/Chicken Rice/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Beef Burger/i).first()).toBeVisible();
    });

    // ── TEST 6: Enter key sends message ─────────────────────

    test('TC-BOT-06: Pressing Enter sends the message', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Menu today');
        await inputField.press('Enter');

        // User message should appear
        await expect(page.getByText('Menu today').last()).toBeVisible();

        // Bot should respond with menu items
        await expect(page.getByText(/Chicken Rice/i).first()).toBeVisible({ timeout: 10000 });
    });

    // ── TEST 7: Dietary/Vegan query ─────────────────────────

    test('TC-BOT-07: Bot responds to vegetarian/vegan food queries', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Show me vegan options');
        await inputField.press('Enter');

        // Bot should respond with vegetarian items
        await expect(page.getByText(/Vegetable Fried Rice/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Fresh Fruit Salad/i).first()).toBeVisible();
        await expect(page.getByText(/Cheese Sandwich/i).first()).toBeVisible();
    });

    // ── TEST 8: Combo deals query ───────────────────────────

    test('TC-BOT-08: Bot responds to combo deals queries', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('What combo deals are available?');
        await inputField.press('Enter');

        // Bot should respond with deals
        await expect(page.getByText(/Student Lunch Combo/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Breakfast Bundle/i).first()).toBeVisible();
    });

    // ── TEST 9: Canteen hours query ─────────────────────────

    test('TC-BOT-09: Bot responds to canteen hours queries', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('What are the canteen hours?');
        await inputField.press('Enter');

        // Bot should respond with canteen timing
        await expect(page.getByText(/Main Campus Canteen/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/07:30/i).first()).toBeVisible();
    });

    // ── TEST 10: Budget / price query ───────────────────────

    test('TC-BOT-10: Bot responds to budget-friendly item queries', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Items under 200');
        await inputField.press('Enter');

        // Bot should respond with budget items
        await expect(page.getByText(/Plain Tea/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/Fish Roll/i).first()).toBeVisible();
    });

    // ── TEST 11: Queue / wait time query ────────────────────

    test('TC-BOT-11: Bot responds to queue and wait time queries', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Which canteen is least busy?');
        await inputField.press('Enter');

        // Bot should respond with queue status
        await expect(page.getByText(/Main Campus Canteen/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/pending/i).first()).toBeVisible();
    });

    // ── TEST 12: Clear chat functionality ───────────────────

    test('TC-BOT-12: Clear chat button resets the conversation', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Send a message first
        const inputField = page.locator('.chatbot-input');
        await inputField.fill('hello');
        await inputField.press('Enter');

        // Wait for bot response (using a more robust wait than timeout)
        await expect(page.getByText(/Hey there!/i).last()).toBeVisible({ timeout: 10000 });

        // Click clear chat button (Trash icon)
        await page.locator('.chatbot-clear').first().click();

        // Chat should be cleared - should show the cleared message
        await expect(page.getByText(/Chat cleared!/i).first()).toBeVisible();
    });

    // ── TEST 13: Chatbot window closes on toggle ────────────

    test('TC-BOT-13: Chatbot window closes when toggle button is clicked again', async ({ page }) => {
        await page.goto('/');

        // Open chatbot
        await page.locator('#chatbot-toggle').first().click();
        const chatWindow = page.locator('#chatbot-window');
        await expect(chatWindow).toBeVisible();

        // Close chatbot
        await page.locator('#chatbot-toggle').first().click();

        // Window should be hidden (using .not.toBeVisible() which handles transitions)
        await expect(chatWindow).not.toBeVisible();
    });

    // ── TEST 14: Send button disabled when input is empty ───

    test('TC-BOT-14: Send button is disabled when input field is empty', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Send button should be disabled with empty input
        const sendBtn = page.locator('.chatbot-send');
        await expect(sendBtn).toBeDisabled();

        // Type something
        const inputField = page.locator('.chatbot-input');
        await inputField.fill('hello');

        // Send button should now be enabled
        await expect(sendBtn).not.toBeDisabled();
    });

    // ── TEST 15: Input disabled while bot is typing ─────────

    test('TC-BOT-15: Input field is disabled while bot is processing response', async ({ page }) => {
        // Use a slower response to catch the typing state
        await page.route('**/api/chatbot/query', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_MENU_RESPONSE),
            });
        });

        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Menu today');
        await inputField.press('Enter');

        // Input should be disabled while waiting for response
        await expect(inputField).toBeDisabled();

        // "Thinking" indicator should be visible
        await expect(page.getByText(/Thinking/i).first()).toBeVisible();
    });

    // ── TEST 16: Error handling with retry ──────────────────

    test('TC-BOT-16: Shows error message and retry button on API failure', async ({ page }) => {
        // Override with error response
        await page.route('**/api/chatbot/query', (route) => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_ERROR_RESPONSE),
            });
        });

        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Test message');
        await inputField.press('Enter');

        // Error message should appear
        await expect(page.getByText(/trouble reaching the kitchen/i).first()).toBeVisible({ timeout: 10000 });

        // Retry button should be visible
        await expect(page.getByRole('button', { name: /Retry/i }).first()).toBeVisible();
    });

    // ── TEST 17: Clicking suggestion chip sends message ─────

    test('TC-BOT-17: Clicking a quick suggestion sends the corresponding query', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // Click the "Menu today" suggestion chip
        await page.locator('.chatbot-suggestion').filter({ hasText: /Menu today/i }).first().click();

        // Bot should respond with menu items
        await expect(page.getByText(/Chicken Rice/i).first()).toBeVisible({ timeout: 10000 });
    });

    // ── TEST 18: Powered by DeepSeek label visible ──────────

    test('TC-BOT-18: Header shows "Powered by DeepSeek AI" branding', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        await expect(page.getByText(/Powered by DeepSeek AI/i).first()).toBeVisible();
    });

    // ── TEST 19: Chatbot footer branding ────────────────────

    test('TC-BOT-19: Footer shows CampusEats branding', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        await expect(page.getByText(/CampusEats · Made with/i).first()).toBeVisible();
    });

    // ── TEST 20: Multi-turn conversation ────────────────────

    test('TC-BOT-20: Chatbot supports multi-turn conversation', async ({ page }) => {
        await page.goto('/');

        await page.locator('#chatbot-toggle').first().click();

        // First message
        const inputField = page.locator('.chatbot-input');
        await inputField.fill('Show me the menu');
        await inputField.press('Enter');
        await expect(page.getByText(/Chicken Rice/i).first()).toBeVisible({ timeout: 10000 });

        // Second message (follow-up)
        await inputField.fill('What about vegan options?');
        await inputField.press('Enter');
        await expect(page.getByText(/Vegetable Fried Rice/i).first()).toBeVisible({ timeout: 10000 });

        // Both user messages should be visible in the chat history
        await expect(page.getByText('Show me the menu').last()).toBeVisible();
        await expect(page.getByText('What about vegan options?').last()).toBeVisible();
    });
});
