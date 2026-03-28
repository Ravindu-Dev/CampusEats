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

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private WebClient webClient;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not set — chatbot will use fallback keyword mode.");
        } else {
            log.info("Gemini API key configured — chatbot will use Gemini AI.");
        }
    }

    // ── Main Entry Point ────────────────────────────────────────

    public Map<String, Object> processQuery(String message) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return fallbackKeywordResponse(message);
        }

        try {
            return geminiResponse(message);
        } catch (Exception e) {
            log.error("Gemini API call failed, falling back to keyword mode", e);
            return fallbackKeywordResponse(message);
        }
    }

    // ── Gemini-Powered Response ─────────────────────────────────

    private Map<String, Object> geminiResponse(String userMessage) {
        // 1. Gather live context from MongoDB
        String context = buildLiveContext();

        // 2. Build the system prompt
        String systemPrompt = buildSystemPrompt(context);

        // 3. Build the Gemini API request body
        Map<String, Object> requestBody = buildGeminiRequest(systemPrompt, userMessage);

        // 4. Call the Gemini API
        String geminiReply = callGeminiApi(requestBody);

        // 5. Return the response
        Map<String, Object> result = new HashMap<>();
        result.put("reply", geminiReply);
        result.put("data", Collections.emptyList());
        return result;
    }

    private String buildLiveContext() {
        StringBuilder ctx = new StringBuilder();

        // Available menu items
        List<MenuItem> menuItems = menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .collect(Collectors.toList());

        ctx.append("=== AVAILABLE MENU ITEMS (").append(menuItems.size()).append(" items) ===\n");
        for (MenuItem item : menuItems) {
            ctx.append("- ").append(item.getName());
            ctx.append(" | Price: Rs. ").append(String.format("%.0f", item.getPrice()));
            ctx.append(" | Category: ").append(item.getCategory() != null ? item.getCategory() : "N/A");
            ctx.append(" | Vegetarian: ").append(item.isVegetarian() ? "Yes" : "No");
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                ctx.append(" | Desc: ").append(item.getDescription());
            }
            ctx.append("\n");
        }

        // Active canteens
        List<Canteen> canteens = canteenRepository.findAll().stream()
                .filter(Canteen::isActive)
                .collect(Collectors.toList());

        ctx.append("\n=== ACTIVE CANTEENS (").append(canteens.size()).append(") ===\n");
        for (Canteen c : canteens) {
            ctx.append("- ").append(c.getCanteenName());
            ctx.append(" | Location: ").append(c.getLocation() != null ? c.getLocation() : "N/A");
            ctx.append(" | Hours: ").append(c.getOpeningTime() != null ? c.getOpeningTime() : "?")
                    .append(" - ").append(c.getClosingTime() != null ? c.getClosingTime() : "?");
            if (c.getDietaryOptions() != null && !c.getDietaryOptions().isEmpty()) {
                ctx.append(" | Dietary: ").append(String.join(", ", c.getDietaryOptions()));
            }
            if (c.getCuisineTypes() != null && !c.getCuisineTypes().isEmpty()) {
                ctx.append(" | Cuisine: ").append(String.join(", ", c.getCuisineTypes()));
            }
            if (c.getOperatingDays() != null && !c.getOperatingDays().isEmpty()) {
                ctx.append(" | Days: ").append(String.join(", ", c.getOperatingDays()));
            }
            ctx.append(" | Rating: ").append(c.getRating());
            ctx.append("\n");
        }

        // Queue / Wait status
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

        // Active combo deals
        List<ComboDeal> activeDeals = comboDealRepository.findAll().stream()
                .filter(ComboDeal::isActive)
                .collect(Collectors.toList());

        ctx.append("\n=== ACTIVE COMBO DEALS (").append(activeDeals.size()).append(") ===\n");
        for (ComboDeal deal : activeDeals) {
            ctx.append("- ").append(deal.getName());
            if (deal.getDescription() != null) {
                ctx.append(" | ").append(deal.getDescription());
            }
            ctx.append(" | Original: Rs. ").append(String.format("%.0f", deal.getOriginalPrice()));
            ctx.append(" | Combo Price: Rs. ").append(String.format("%.0f", deal.getComboPrice()));
            if (deal.getDiscountPercent() != null) {
                ctx.append(" | Discount: ").append(String.format("%.0f%%", deal.getDiscountPercent()));
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
                "- Keep answers concise (under 150 words unless the user asks for detail)\n" +
                "- Use Markdown formatting: **bold** for emphasis, bullet points for lists\n" +
                "- When listing menu items, show name & price clearly\n" +
                "- Add a veg indicator 🟢 (vegetarian) or 🔴 (non-veg) next to food items\n\n" +
                "## Your Capabilities\n" +
                "- Answer questions about available menu items, prices, and categories\n" +
                "- Help with dietary needs (vegetarian, vegan, halal options)\n" +
                "- Tell which canteen is least/most busy based on live queue data\n" +
                "- Share canteen operating hours and locations\n" +
                "- Recommend combo deals and promotions\n" +
                "- Suggest cheapest items or items within a budget\n\n" +
                "## Rules\n" +
                "- When answering about what items are available to buy, prices, or canteens, ONLY use the live data below. NEVER make up items, prices, or canteens.\n" +
                "- If the user asks a general food question (e.g., \"What is a burger?\", \"How to make pasta?\"), you CAN answer it playfully using your general knowledge.\n" +
                "- If a requested item is not in the live data, clearly state it is not available on campus right now.\n" +
                "- Do NOT answer questions completely unrelated to food, canteens, or CampusEats.\n" +
                "- For unrelated questions, politely redirect: \"I'm your food buddy! Ask me about menus, deals, wait times, or just food in general 🍔\"\n\n" +
                "## Live Campus Data (fetched just now from our database):\n\n" +
                liveContext;
    }

    private Map<String, Object> buildGeminiRequest(String systemPrompt, String userMessage) {
        // Build the request structure for Gemini API
        Map<String, Object> request = new HashMap<>();

        // System instruction
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
        request.put("system_instruction", systemInstruction);

        // User message
        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(Map.of("text", userMessage)));
        request.put("contents", List.of(userContent));

        // Generation config
        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", 0.7);
        genConfig.put("maxOutputTokens", 500);
        genConfig.put("topP", 0.9);
        request.put("generationConfig", genConfig);

        return request;
    }

    private String callGeminiApi(Map<String, Object> requestBody) {
        try {
            String responseJson = webClient.post()
                    .uri(GEMINI_API_URL + "?key=" + geminiApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse the response to extract the text
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }

            log.warn("Unexpected Gemini response structure: {}", responseJson);
            return "Hmm, I got a bit confused there. Try asking again! 🍔";

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("Gemini API call failed", e);
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
