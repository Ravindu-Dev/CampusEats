package com.campuseats.service;

import com.campuseats.dto.CanteenQueueStatusDTO;
import com.campuseats.model.Canteen;
import com.campuseats.model.ComboDeal;
import com.campuseats.model.MenuItem;
import com.campuseats.repository.CanteenRepository;
import com.campuseats.repository.ComboDealRepository;
import com.campuseats.repository.MenuItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final MenuItemRepository menuItemRepository;
    private final CanteenRepository canteenRepository;
    private final ComboDealRepository comboDealRepository;
    private final CanteenService canteenService;
    private final ObjectMapper objectMapper;

    @Value("${deepseek.api.key:}")
    private String deepseekApiKey;

    private WebClient webClient;

    private static final String DEEPSEEK_API_URL =
            "https://api.deepseek.com/chat/completions";

    // Max history messages to send (to avoid token overflow)
    private static final int MAX_HISTORY_MESSAGES = 10;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();

        if (deepseekApiKey == null || deepseekApiKey.isBlank()) {
            log.warn("DEEPSEEK_API_KEY is not set — chatbot will use fallback keyword mode.");
        } else {
            log.info("DeepSeek API key configured — chatbot will use DeepSeek AI.");
        }
    }

    // ── Main Entry Point ────────────────────────────────────────

    public Map<String, Object> processQuery(String message, List<Map<String, String>> history) {
        if (deepseekApiKey == null || deepseekApiKey.isBlank()) {
            return fallbackKeywordResponse(message);
        }

        try {
            return deepseekResponse(message, history);
        } catch (Exception e) {
            log.error("DeepSeek API call failed, falling back to keyword mode", e);
            return fallbackKeywordResponse(message);
        }
    }

    // ── DeepSeek-Powered Response (with conversation memory) ────

    private Map<String, Object> deepseekResponse(String userMessage, List<Map<String, String>> history) {
        // 1. Gather live context from MongoDB
        String context = buildLiveContext();

        // 2. Build the system prompt
        String systemPrompt = buildSystemPrompt(context);

        // 3. Build the DeepSeek API request body with conversation history
        Map<String, Object> requestBody = buildDeepseekRequest(systemPrompt, userMessage, history);

        // 4. Call the DeepSeek API
        String deepseekReply = callDeepseekApi(requestBody);

        // 5. Return the response
        Map<String, Object> result = new HashMap<>();
        result.put("reply", deepseekReply);
        result.put("data", Collections.emptyList());
        return result;
    }

    private String buildLiveContext() {
        StringBuilder ctx = new StringBuilder();

        // Build canteen lookup map (id -> canteen) for resolving item canteen names
        List<Canteen> canteens = canteenRepository.findAll().stream()
                .filter(Canteen::isActive)
                .collect(Collectors.toList());
        Map<String, Canteen> canteenMap = canteens.stream()
                .collect(Collectors.toMap(Canteen::getId, c -> c, (a, b) -> a));

        // ── Available menu items (with full details) ──
        List<MenuItem> menuItems = menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .collect(Collectors.toList());

        ctx.append("=== AVAILABLE MENU ITEMS (").append(menuItems.size()).append(" items) ===\n");
        for (MenuItem item : menuItems) {
            ctx.append("- ").append(item.getName());
            ctx.append(" | Price: Rs. ").append(String.format("%.0f", item.getPrice()));
            ctx.append(" | Category: ").append(item.getCategory() != null ? item.getCategory() : "N/A");
            ctx.append(" | Vegetarian: ").append(item.isVegetarian() ? "Yes" : "No");

            // Resolve which canteen this item belongs to
            if (item.getCanteenId() != null && canteenMap.containsKey(item.getCanteenId())) {
                ctx.append(" | Canteen: ").append(canteenMap.get(item.getCanteenId()).getCanteenName());
            }

            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                ctx.append(" | Description: ").append(item.getDescription());
            }
            if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                ctx.append(" | ImageURL: ").append(item.getImageUrl());
            }
            ctx.append("\n");
        }

        // ── Active canteens (with full details) ──
        ctx.append("\n=== ACTIVE CANTEENS (").append(canteens.size()).append(") ===\n");
        for (Canteen c : canteens) {
            ctx.append("- ").append(c.getCanteenName());
            ctx.append(" | Location: ").append(c.getLocation() != null ? c.getLocation() : "N/A");
            if (c.getFloorNumber() != null) {
                ctx.append(", Floor ").append(c.getFloorNumber());
            }
            ctx.append(" | Hours: ").append(c.getOpeningTime() != null ? c.getOpeningTime() : "?")
                    .append(" - ").append(c.getClosingTime() != null ? c.getClosingTime() : "?");
            if (c.getOperatingDays() != null && !c.getOperatingDays().isEmpty()) {
                ctx.append(" | Days: ").append(String.join(", ", c.getOperatingDays()));
            }
            if (c.getAveragePreparationTime() != null) {
                ctx.append(" | Avg Prep Time: ").append(c.getAveragePreparationTime()).append(" min");
            }
            if (c.getSeatingCapacity() != null) {
                ctx.append(" | Seating: ").append(c.getSeatingCapacity());
            }
            ctx.append(" | Delivery: ").append(c.isDeliveryAvailable() ? "Yes" : "No");
            ctx.append(" | Pickup: ").append(c.isPickupAvailable() ? "Yes" : "No");
            if (c.getDietaryOptions() != null && !c.getDietaryOptions().isEmpty()) {
                ctx.append(" | Dietary: ").append(String.join(", ", c.getDietaryOptions()));
            }
            if (c.getCuisineTypes() != null && !c.getCuisineTypes().isEmpty()) {
                ctx.append(" | Cuisine: ").append(String.join(", ", c.getCuisineTypes()));
            }
            if (c.getSpecialtyItems() != null && !c.getSpecialtyItems().isEmpty()) {
                ctx.append(" | Specialties: ").append(c.getSpecialtyItems());
            }
            if (c.getAcceptedPaymentMethods() != null && !c.getAcceptedPaymentMethods().isEmpty()) {
                ctx.append(" | Payment: ").append(String.join(", ", c.getAcceptedPaymentMethods()));
            }
            ctx.append(" | Rating: ").append(c.getRating());
            if (c.getTotalRatings() != null && c.getTotalRatings() > 0) {
                ctx.append(" (").append(c.getTotalRatings()).append(" reviews)");
            }
            if (c.getDescription() != null && !c.getDescription().isEmpty()) {
                ctx.append(" | About: ").append(c.getDescription());
            }
            ctx.append("\n");
        }

        // ── Queue / Wait status ──
        try {
            List<CanteenQueueStatusDTO> queueStatus = canteenService.getAllCanteenQueueStatus();
            ctx.append("\n=== LIVE WAIT TIMES / QUEUE STATUS ===\n");
            for (CanteenQueueStatusDTO q : queueStatus) {
                ctx.append("- ").append(q.getCanteenName())
                        .append(" | Pending Orders: ").append(q.getPendingOrderCount())
                        .append(" | Status: ").append(q.getQueueStatus())
                        .append("\n");
            }
        } catch (Exception e) {
            ctx.append("\n=== WAIT TIMES: Unable to fetch ===\n");
        }

        // ── Active combo deals (with item breakdown) ──
        List<ComboDeal> activeDeals = comboDealRepository.findAll().stream()
                .filter(ComboDeal::isActive)
                .collect(Collectors.toList());

        ctx.append("\n=== ACTIVE COMBO DEALS (").append(activeDeals.size()).append(") ===\n");
        for (ComboDeal deal : activeDeals) {
            ctx.append("- ").append(deal.getName());
            if (deal.getDescription() != null) {
                ctx.append(" | ").append(deal.getDescription());
            }
            if (deal.getCategory() != null) {
                ctx.append(" | Type: ").append(deal.getCategory());
            }
            ctx.append(" | Original: Rs. ").append(String.format("%.0f", deal.getOriginalPrice()));
            ctx.append(" | Combo Price: Rs. ").append(String.format("%.0f", deal.getComboPrice()));
            if (deal.getDiscountPercent() != null) {
                ctx.append(" | Discount: ").append(String.format("%.0f%%", deal.getDiscountPercent()));
            }
            // List combo items
            if (deal.getItems() != null && !deal.getItems().isEmpty()) {
                ctx.append(" | Includes: ");
                List<String> itemNames = deal.getItems().stream()
                        .map(ci -> ci.getName() + (ci.getQuantity() != null && ci.getQuantity() > 1
                                ? " x" + ci.getQuantity() : ""))
                        .collect(Collectors.toList());
                ctx.append(String.join(", ", itemNames));
            }
            // Resolve canteen name for combo deal
            if (deal.getCanteenId() != null && canteenMap.containsKey(deal.getCanteenId())) {
                ctx.append(" | From: ").append(canteenMap.get(deal.getCanteenId()).getCanteenName());
            }
            ctx.append("\n");
        }

        return ctx.toString();
    }

    private String buildSystemPrompt(String liveContext) {
        return "You are **Eatsbot** 🍔, the friendly and enthusiastic AI assistant mascot for CampusEats — " +
                "a campus food delivery and canteen pre-order system.\n\n" +
                "## Your Personality\n" +
                "- Friendly, upbeat, and helpful — like a cheerful anime burger character\n" +
                "- Use emojis naturally but don't overdo it (2-4 per message)\n" +
                "- Use Markdown formatting: **bold** for emphasis, bullet points for lists\n" +
                "- Add a veg indicator 🟢 (vegetarian) or 🔴 (non-veg) next to food items\n\n" +
                "## Your Capabilities\n" +
                "- Answer questions about available menu items, prices, categories, and descriptions\n" +
                "- Provide detailed information about specific food items when asked\n" +
                "- Help with dietary needs (vegetarian, vegan, halal options)\n" +
                "- Tell which canteen is least/most busy based on live queue data\n" +
                "- Share canteen operating hours, locations, seating, prep time, delivery/pickup options\n" +
                "- Recommend combo deals and promotions with item breakdowns\n" +
                "- Suggest cheapest items or items within a budget\n" +
                "- Remember previous messages in the conversation and refer back to them\n\n" +
                "## How to Answer About Specific Food Items\n" +
                "When a user asks about a specific food item (e.g., \"tell me about the chicken burger\", \"what is kottu?\"), provide a DETAILED response including:\n" +
                "1. **Item name** with veg/non-veg indicator\n" +
                "2. **Price** in Rs.\n" +
                "3. **Description** if available in the data\n" +
                "4. **Category** (Breakfast, Lunch, Snacks, etc.)\n" +
                "5. **Which canteen** sells it\n" +
                "6. **Current availability** status\n" +
                "If the item has an ImageURL in the data, include it as a markdown image: ![Item Name](imageUrl)\n" +
                "If multiple items match, list all of them with their details.\n\n" +
                "## How to Answer About Canteens\n" +
                "When asked about a specific canteen, include:\n" +
                "- Location, floor, operating hours, operating days\n" +
                "- Cuisine types and dietary options\n" +
                "- Seating capacity, delivery/pickup availability\n" +
                "- Average preparation time\n" +
                "- Rating and number of reviews\n" +
                "- Accepted payment methods\n" +
                "- Specialty items\n" +
                "- Current queue/wait status if available\n\n" +
                "## How to Answer About Combo Deals\n" +
                "When asked about combo deals, include:\n" +
                "- Deal name and description\n" +
                "- Original price vs combo price and discount %\n" +
                "- What items are included in the combo\n" +
                "- Which canteen offers it\n\n" +
                "## Rules\n" +
                "- When answering about what items are available to buy, prices, or canteens, ONLY use the live data below. NEVER make up items, prices, or canteens.\n" +
                "- If the user asks a general food question (e.g., \"What is a burger?\", \"How to make pasta?\"), you CAN answer it playfully using your general knowledge.\n" +
                "- If a requested item is not in the live data, clearly state it is not available on campus right now.\n" +
                "- Do NOT answer questions completely unrelated to food, canteens, or CampusEats.\n" +
                "- For unrelated questions, politely redirect: \"I'm your food buddy! Ask me about menus, deals, wait times, or just food in general 🍔\"\n" +
                "- You have conversation memory — use it to give contextual follow-up answers.\n" +
                "- Keep answers under 200 words unless the user specifically asks for more detail.\n\n" +
                "## Live Campus Data (fetched just now from our database):\n\n" +
                liveContext;
    }

    private Map<String, Object> buildDeepseekRequest(String systemPrompt, String userMessage,
                                                      List<Map<String, String>> history) {
        // Build the request structure for DeepSeek API (OpenAI-compatible format)
        Map<String, Object> request = new HashMap<>();

        request.put("model", "deepseek-chat");

        // Messages array: system + history + current user message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        // Add conversation history (limited to last N messages to avoid token overflow)
        if (history != null && !history.isEmpty()) {
            List<Map<String, String>> trimmedHistory = history;
            if (history.size() > MAX_HISTORY_MESSAGES) {
                trimmedHistory = history.subList(history.size() - MAX_HISTORY_MESSAGES, history.size());
            }
            for (Map<String, String> msg : trimmedHistory) {
                String role = msg.get("role");
                String content = msg.get("content");
                if (role != null && content != null) {
                    // Map 'bot' role to 'assistant' for OpenAI-compatible API
                    String apiRole = "bot".equals(role) ? "assistant" : role;
                    messages.add(Map.of("role", apiRole, "content", content));
                }
            }
        }

        // Add the current user message
        messages.add(Map.of("role", "user", "content", userMessage));
        request.put("messages", messages);

        // Generation config
        request.put("temperature", 0.7);
        request.put("max_tokens", 500);
        request.put("top_p", 0.9);

        return request;
    }

    private String callDeepseekApi(Map<String, Object> requestBody) {
        try {
            String responseJson = webClient.post()
                    .uri(DEEPSEEK_API_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + deepseekApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse the OpenAI-compatible response
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                String content = choices.get(0).path("message").path("content").asText();
                if (content != null && !content.isEmpty()) {
                    return content;
                }
            }

            log.warn("Unexpected DeepSeek response structure: {}", responseJson);
            return "Hmm, I got a bit confused there. Try asking again! 🍔";

        } catch (Exception e) {
            log.error("Error calling DeepSeek API: {}", e.getMessage());
            throw new RuntimeException("DeepSeek API call failed", e);
        }
    }

    // ── Fallback Keyword Mode (when no API key) ─────────────────

    private Map<String, Object> fallbackKeywordResponse(String message) {
        String lower = message.toLowerCase().trim();
        Map<String, Object> result = new HashMap<>();

        if (isGreeting(lower)) {
            result.put("reply",
                    "Hey there! 🍔 I'm Eatsbot, your CampusEats assistant! I can help you with:\n\n"
                            + "🍽️ **Menu** — What's available to eat\n"
                            + "🥗 **Dietary options** — Veg, vegan, halal filters\n"
                            + "⏱️ **Wait times** — Which canteen is least busy\n"
                            + "💰 **Deals** — Active combo deals & offers\n"
                            + "🕐 **Hours** — Canteen timings\n\n"
                            + "Just ask me anything!");
        } else if (lower.contains("vegan") || lower.contains("vegetarian") || lower.contains("veg")
                || lower.contains("halal") || lower.contains("diet")) {
            // Dietary options
            List<MenuItem> vegItems = menuItemRepository.findAll().stream()
                    .filter(MenuItem::isAvailable)
                    .filter(MenuItem::isVegetarian)
                    .limit(10)
                    .collect(Collectors.toList());
            if (vegItems.isEmpty()) {
                result.put("reply", "🥗 No vegetarian/vegan items are listed right now. Check back later or browse the menu! 🍔");
            } else {
                StringBuilder sb = new StringBuilder("🥗 Here are the **vegetarian/vegan** options:\n\n");
                for (MenuItem item : vegItems) {
                    sb.append("🟢 **").append(item.getName()).append("** — Rs. ")
                            .append(String.format("%.0f", item.getPrice()));
                    if (item.getCategory() != null) {
                        sb.append(" (").append(item.getCategory()).append(")");
                    }
                    sb.append("\n");
                }
                result.put("reply", sb.toString());
            }
        } else if (lower.contains("menu") || lower.contains("food") || lower.contains("eat")
                || lower.contains("item") || lower.contains("available")) {
            List<MenuItem> items = menuItemRepository.findAll().stream()
                    .filter(MenuItem::isAvailable).limit(10).collect(Collectors.toList());
            StringBuilder sb = new StringBuilder("🍽️ Here are some available items:\n\n");
            for (MenuItem item : items) {
                String icon = item.isVegetarian() ? "🟢" : "🔴";
                sb.append(icon).append(" **").append(item.getName()).append("** — Rs. ")
                        .append(String.format("%.0f", item.getPrice())).append("\n");
            }
            result.put("reply", sb.toString());
        } else if (lower.contains("deal") || lower.contains("combo") || lower.contains("offer")
                || lower.contains("discount") || lower.contains("promo")) {
            // Combo deals
            List<ComboDeal> deals = comboDealRepository.findAll().stream()
                    .filter(ComboDeal::isActive)
                    .collect(Collectors.toList());
            if (deals.isEmpty()) {
                result.put("reply", "🎁 No active combo deals right now. Keep checking — new deals drop often! 🍔");
            } else {
                StringBuilder sb = new StringBuilder("🎁 **Active Combo Deals:**\n\n");
                for (ComboDeal deal : deals) {
                    sb.append("🔥 **").append(deal.getName()).append("**");
                    if (deal.getDescription() != null) {
                        sb.append(" — ").append(deal.getDescription());
                    }
                    sb.append("\n   ~~Rs. ").append(String.format("%.0f", deal.getOriginalPrice()))
                            .append("~~ → **Rs. ").append(String.format("%.0f", deal.getComboPrice())).append("**");
                    if (deal.getDiscountPercent() != null) {
                        sb.append(" (").append(String.format("%.0f", deal.getDiscountPercent())).append("% off!)");
                    }
                    sb.append("\n\n");
                }
                result.put("reply", sb.toString());
            }
        } else if (lower.contains("cheap") || lower.contains("budget") || lower.contains("under")
                || lower.contains("affordable") || lower.contains("price") || lower.contains("low")) {
            // Budget items — find items under Rs. 200 (or parse number from query)
            double maxPrice = 200;
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d+").matcher(lower);
                if (m.find()) maxPrice = Double.parseDouble(m.group());
            } catch (Exception ignored) {}
            final double limit = maxPrice;
            List<MenuItem> cheapItems = menuItemRepository.findAll().stream()
                    .filter(MenuItem::isAvailable)
                    .filter(item -> item.getPrice() <= limit)
                    .sorted(Comparator.comparingDouble(MenuItem::getPrice))
                    .limit(10)
                    .collect(Collectors.toList());
            if (cheapItems.isEmpty()) {
                result.put("reply", "💰 No items found under Rs. " + String.format("%.0f", limit) + " right now. Try a higher budget! 🍔");
            } else {
                StringBuilder sb = new StringBuilder("💰 Items under **Rs. ")
                        .append(String.format("%.0f", limit)).append("**:\n\n");
                for (MenuItem item : cheapItems) {
                    String icon = item.isVegetarian() ? "🟢" : "🔴";
                    sb.append(icon).append(" **").append(item.getName()).append("** — Rs. ")
                            .append(String.format("%.0f", item.getPrice())).append("\n");
                }
                result.put("reply", sb.toString());
            }
        } else if (lower.contains("hour") || lower.contains("time") || lower.contains("open")
                || lower.contains("close") || lower.contains("timing") || lower.contains("schedule")) {
            // Canteen hours
            List<Canteen> canteens = canteenRepository.findAll().stream()
                    .filter(Canteen::isActive)
                    .collect(Collectors.toList());
            if (canteens.isEmpty()) {
                result.put("reply", "🕐 No canteen info available right now. Check back soon! 🍔");
            } else {
                StringBuilder sb = new StringBuilder("🕐 **Canteen Hours:**\n\n");
                for (Canteen c : canteens) {
                    sb.append("🏪 **").append(c.getCanteenName()).append("**\n");
                    sb.append("   ⏰ ").append(c.getOpeningTime() != null ? c.getOpeningTime() : "N/A")
                            .append(" – ").append(c.getClosingTime() != null ? c.getClosingTime() : "N/A").append("\n");
                    if (c.getOperatingDays() != null && !c.getOperatingDays().isEmpty()) {
                        sb.append("   📅 ").append(String.join(", ", c.getOperatingDays())).append("\n");
                    }
                    if (c.getLocation() != null) {
                        sb.append("   📍 ").append(c.getLocation()).append("\n");
                    }
                    sb.append("\n");
                }
                result.put("reply", sb.toString());
            }
        } else if (lower.contains("busy") || lower.contains("wait") || lower.contains("queue")
                || lower.contains("crowd") || lower.contains("line")) {
            List<CanteenQueueStatusDTO> queue = canteenService.getAllCanteenQueueStatus();
            queue.sort(Comparator.comparingInt(CanteenQueueStatusDTO::getPendingOrderCount));
            StringBuilder sb = new StringBuilder("⏱️ Live wait status:\n\n");
            for (CanteenQueueStatusDTO q : queue) {
                String emoji = q.getQueueStatus().equals("HIGH") ? "🔴" :
                        q.getQueueStatus().equals("MEDIUM") ? "🟡" : "🟢";
                sb.append(emoji).append(" **").append(q.getCanteenName()).append("** — ")
                        .append(q.getPendingOrderCount()).append(" pending\n");
            }
            result.put("reply", sb.toString());
        } else if (lower.contains("help")) {
            result.put("reply",
                    "🍔 **Here's what I can help with:**\n\n"
                            + "🍽️ **\"Menu today\"** — See available items\n"
                            + "🥗 **\"Vegan options\"** — Vegetarian/vegan items\n"
                            + "⏱️ **\"Least busy canteen\"** — Live wait times\n"
                            + "🎁 **\"Combo deals\"** — Active deals & discounts\n"
                            + "💰 **\"Items under 200\"** — Budget-friendly picks\n"
                            + "🕐 **\"Canteen hours\"** — Opening & closing times\n\n"
                            + "Just type your question!");
        } else {
            result.put("reply",
                    "🤔 I'm not sure I understood that. Try asking about:\n\n"
                            + "• **Menu** / food items\n• **Vegan** / vegetarian options\n"
                            + "• Which canteen is least **busy**\n• **Combo deals** & offers\n"
                            + "• Items under a **budget**\n• Canteen **hours**\n\n"
                            + "Or type **help**! 🍔");
        }

        result.put("data", Collections.emptyList());
        return result;
    }

    private boolean isGreeting(String msg) {
        String[] greetings = {"hi", "hello", "hey", "sup", "yo", "good morning", "good afternoon",
                "good evening", "what's up", "howdy", "hola"};
        for (String g : greetings) {
            if (msg.equals(g) || msg.startsWith(g + " ") || msg.startsWith(g + "!")) return true;
        }
        return false;
    }
}
