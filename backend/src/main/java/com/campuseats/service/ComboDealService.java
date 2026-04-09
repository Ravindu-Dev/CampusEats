package com.campuseats.service;

import com.campuseats.dto.ComboDealRequest;
import com.campuseats.dto.ComboDealResponse;
import com.campuseats.model.ComboDeal;
import com.campuseats.model.MenuItem;
import com.campuseats.model.Order;
import com.campuseats.repository.ComboDealRepository;
import com.campuseats.repository.MenuItemRepository;
import com.campuseats.repository.OrderRepository;
import com.campuseats.repository.CanteenRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComboDealService {

    private final ComboDealRepository comboDealRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final CanteenRepository canteenRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.recommendation.api.key:}")
    private String geminiRecommendationApiKey;

    private WebClient webClient;

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();

        if (geminiRecommendationApiKey == null || geminiRecommendationApiKey.isBlank()) {
            log.warn("GEMINI_RECOMMENDATION_API_KEY is not set — combo recommendations will use fallback mode.");
        } else {
            log.info("Gemini Recommendation API key configured — combo deals will use AI-powered recommendations.");
        }
    }

    // ── CRUD Operations ──

    public ComboDealResponse createComboDeal(String canteenId, ComboDealRequest request) {
        ComboDeal deal = new ComboDeal();
        deal.setCanteenId(canteenId);
        deal.setName(request.getName());
        deal.setDescription(request.getDescription());
        deal.setImageUrl(request.getImageUrl());
        deal.setCategory(request.getCategory());
        deal.setComboPrice(request.getComboPrice());
        deal.setValidFrom(request.getValidFrom());
        deal.setValidUntil(request.getValidUntil());
        deal.setMinWeeklySpend(request.getMinWeeklySpend() != null ? request.getMinWeeklySpend() : 5000.0);
        deal.setActive(request.isActive());

        // Resolve menu items and build combo items list
        List<ComboDeal.ComboItem> comboItems = new ArrayList<>();
        double originalPrice = 0;

        for (ComboDealRequest.ComboItemDTO itemDTO : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDTO.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemDTO.getMenuItemId()));

            ComboDeal.ComboItem comboItem = new ComboDeal.ComboItem();
            comboItem.setMenuItemId(menuItem.getId());
            comboItem.setName(menuItem.getName());
            comboItem.setPrice(menuItem.getPrice());
            comboItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1);
            comboItem.setImageUrl(menuItem.getImageUrl());
            comboItems.add(comboItem);

            originalPrice += menuItem.getPrice() * comboItem.getQuantity();
        }

        deal.setItems(comboItems);
        deal.setOriginalPrice(originalPrice);

        // Calculate discount percent
        if (originalPrice > 0) {
            deal.setDiscountPercent(Math.round((1 - request.getComboPrice() / originalPrice) * 100.0 * 10.0) / 10.0);
        } else {
            deal.setDiscountPercent(0.0);
        }

        ComboDeal saved = comboDealRepository.save(deal);
        return convertToResponse(saved, null);
    }

    public ComboDealResponse updateComboDeal(String dealId, String canteenId, ComboDealRequest request) {
        ComboDeal deal = comboDealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Combo deal not found"));

        if (!deal.getCanteenId().equals(canteenId)) {
            throw new RuntimeException("Unauthorized: This combo deal does not belong to your canteen");
        }

        deal.setName(request.getName());
        deal.setDescription(request.getDescription());
        deal.setImageUrl(request.getImageUrl());
        deal.setCategory(request.getCategory());
        deal.setComboPrice(request.getComboPrice());
        deal.setValidFrom(request.getValidFrom());
        deal.setValidUntil(request.getValidUntil());
        deal.setMinWeeklySpend(request.getMinWeeklySpend() != null ? request.getMinWeeklySpend() : 5000.0);
        deal.setActive(request.isActive());

        // Re-resolve menu items
        List<ComboDeal.ComboItem> comboItems = new ArrayList<>();
        double originalPrice = 0;

        for (ComboDealRequest.ComboItemDTO itemDTO : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDTO.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemDTO.getMenuItemId()));

            ComboDeal.ComboItem comboItem = new ComboDeal.ComboItem();
            comboItem.setMenuItemId(menuItem.getId());
            comboItem.setName(menuItem.getName());
            comboItem.setPrice(menuItem.getPrice());
            comboItem.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1);
            comboItem.setImageUrl(menuItem.getImageUrl());
            comboItems.add(comboItem);

            originalPrice += menuItem.getPrice() * comboItem.getQuantity();
        }

        deal.setItems(comboItems);
        deal.setOriginalPrice(originalPrice);

        if (originalPrice > 0) {
            deal.setDiscountPercent(Math.round((1 - request.getComboPrice() / originalPrice) * 100.0 * 10.0) / 10.0);
        }

        ComboDeal saved = comboDealRepository.save(deal);
        return convertToResponse(saved, null);
    }

    public void deleteComboDeal(String dealId, String canteenId) {
        ComboDeal deal = comboDealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Combo deal not found"));

        if (!deal.getCanteenId().equals(canteenId)) {
            throw new RuntimeException("Unauthorized: This combo deal does not belong to your canteen");
        }

        comboDealRepository.delete(deal);
    }

    public List<ComboDealResponse> getCanteenComboDeals(String canteenId) {
        return comboDealRepository.findByCanteenId(canteenId).stream()
                .map(deal -> convertToResponse(deal, null))
                .collect(Collectors.toList());
    }

    public List<ComboDealResponse> getAllActiveComboDeals() {
        return comboDealRepository.findByActiveTrue().stream()
                .filter(this::isCurrentlyValid)
                .map(deal -> convertToResponse(deal, null))
                .collect(Collectors.toList());
    }

    // ── Recommendation Engine (Gemini AI + Rule-Based Fallback) ──

    public List<ComboDealResponse> getRecommendedCombos(String userId) {
        // 1. Get all active combo deals
        List<ComboDeal> activeDeals = comboDealRepository.findByActiveTrue().stream()
                .filter(this::isCurrentlyValid)
                .collect(Collectors.toList());

        if (activeDeals.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Get user's orders from the past 7 days
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Order> recentOrders = orderRepository.findByUserIdAndPaymentStatusAndCreatedAtAfter(
                userId, "succeeded", weekAgo);

        // 3. No order history = no personalized recommendations
        if (recentOrders.isEmpty()) {
            log.debug("User {} has no recent orders — skipping recommendations.", userId);
            return Collections.emptyList();
        }

        // 4. If no API key, use rule-based engine instead of Gemini
        boolean hasApiKey = geminiRecommendationApiKey != null
                && !geminiRecommendationApiKey.isBlank()
                && !geminiRecommendationApiKey.equals("YOUR_GEMINI_RECOMMENDATION_API_KEY_HERE");

        if (!hasApiKey) {
            log.info("No Gemini API key — using rule-based recommendation engine for user {}", userId);
            return getRuleBasedRecommendations(userId, activeDeals, recentOrders);
        }

        // 5. Build context for Gemini
        String userContext = buildUserContext(recentOrders);
        String comboContext = buildComboContext(activeDeals);

        // 6. Call Gemini AI for personalized recommendations
        try {
            String geminiResponse = callGeminiForRecommendations(userContext, comboContext);
            List<GeminiRecommendation> recommendations = parseGeminiResponse(geminiResponse);

            if (recommendations.isEmpty()) {
                log.debug("Gemini returned no high-confidence recommendations — trying rule-based fallback.");
                return getRuleBasedRecommendations(userId, activeDeals, recentOrders);
            }

            // 7. Map Gemini recommendations to combo responses, filtering by relevance
            Map<String, ComboDeal> dealMap = activeDeals.stream()
                    .collect(Collectors.toMap(ComboDeal::getId, d -> d));

            List<ComboDealResponse> result = new ArrayList<>();
            for (GeminiRecommendation rec : recommendations) {
                // Only include recommendations with relevance score >= 60
                if (rec.relevanceScore < 60) continue;

                ComboDeal deal = dealMap.get(rec.comboId);
                if (deal != null) {
                    ComboDealResponse response = convertToResponse(deal, null);
                    response.setRecommended(true);
                    response.setRecommendationReason(rec.reason);
                    result.add(response);
                }
            }

            if (result.isEmpty()) {
                log.debug("No Gemini recommendations met relevance threshold — trying rule-based fallback.");
                return getRuleBasedRecommendations(userId, activeDeals, recentOrders);
            }

            log.info("Gemini AI recommended {} relevant combos for user {}", result.size(), userId);
            return result;

        } catch (Exception e) {
            log.error("Gemini recommendation API failed: {} — falling back to rule-based engine", e.getMessage());
            return getRuleBasedRecommendations(userId, activeDeals, recentOrders);
        }
    }

    // ── Rule-Based Recommendation Engine ──

    /**
     * Scores combo deals against the user's recent order history without any external API.
     *
     * Scoring (0 – 100):
     *   • Item overlap  : up to 65 pts  — (matching items / total combo items) × 65
     *   • Canteen bonus : up to 35 pts  — whether the user has ordered from this canteen this week
     *
     * Only combos scoring >= 60 are returned, keeping recommendations relevant.
     */
    private List<ComboDealResponse> getRuleBasedRecommendations(
            String userId, List<ComboDeal> activeDeals, List<Order> recentOrders) {

        // Build normalised sets from order history
        Set<String> orderedItemNames = new HashSet<>();
        Set<String> visitedCanteenIds = new HashSet<>();
        Map<String, Integer> itemFrequency = new HashMap<>();   // item name → total qty ordered
        Map<String, Double> canteenSpend = new HashMap<>();     // canteen id → total spend

        for (Order order : recentOrders) {
            for (Order.OrderItem item : order.getOrderItems()) {
                String normName = item.getName().trim().toLowerCase();
                orderedItemNames.add(normName);
                itemFrequency.merge(normName, item.getQuantity(), Integer::sum);
                visitedCanteenIds.add(item.getCanteenId());
                canteenSpend.merge(item.getCanteenId(),
                        item.getPrice() * item.getQuantity(), Double::sum);
            }
        }

        List<ComboDealResponse> result = new ArrayList<>();

        for (ComboDeal deal : activeDeals) {
            List<ComboDeal.ComboItem> comboItems = deal.getItems();
            if (comboItems == null || comboItems.isEmpty()) continue;

            // ── Item overlap score ──
            long matchedItems = comboItems.stream()
                    .filter(ci -> orderedItemNames.contains(ci.getName().trim().toLowerCase()))
                    .count();
            double itemScore = ((double) matchedItems / comboItems.size()) * 65.0;

            // ── Canteen familiarity score ──
            double canteenScore = visitedCanteenIds.contains(deal.getCanteenId()) ? 35.0 : 0.0;

            int totalScore = (int) Math.round(itemScore + canteenScore);

            if (totalScore < 60) continue;

            // ── Generate a reason string ──
            String reason = buildRuleBasedReason(deal, comboItems, orderedItemNames,
                    itemFrequency, visitedCanteenIds, matchedItems);

            ComboDealResponse response = convertToResponse(deal, null);
            response.setRecommended(true);
            response.setRecommendationReason(reason);
            result.add(response);
        }

        // Sort: highest item match first
        result.sort((a, b) -> {
            long aMatch = activeDeals.stream()
                    .filter(d -> d.getId().equals(a.getId())).findFirst()
                    .map(d -> d.getItems().stream()
                            .filter(ci -> orderedItemNames.contains(ci.getName().trim().toLowerCase()))
                            .count()).orElse(0L);
            long bMatch = activeDeals.stream()
                    .filter(d -> d.getId().equals(b.getId())).findFirst()
                    .map(d -> d.getItems().stream()
                            .filter(ci -> orderedItemNames.contains(ci.getName().trim().toLowerCase()))
                            .count()).orElse(0L);
            return Long.compare(bMatch, aMatch);
        });

        log.info("Rule-based engine recommended {} combos for user {}", result.size(), userId);
        return result;
    }

    /**
     * Builds a short, human-readable recommendation reason (4–7 words) from rule-based signals.
     */
    private String buildRuleBasedReason(
            ComboDeal deal,
            List<ComboDeal.ComboItem> comboItems,
            Set<String> orderedItemNames,
            Map<String, Integer> itemFrequency,
            Set<String> visitedCanteenIds,
            long matchedItems) {

        // Find the most-ordered matched item in this combo
        Optional<ComboDeal.ComboItem> topItem = comboItems.stream()
                .filter(ci -> orderedItemNames.contains(ci.getName().trim().toLowerCase()))
                .max(Comparator.comparingInt(
                        ci -> itemFrequency.getOrDefault(ci.getName().trim().toLowerCase(), 0)));

        boolean isFromFavCanteen = visitedCanteenIds.contains(deal.getCanteenId());
        boolean allItemsMatch = matchedItems == comboItems.size();

        if (allItemsMatch) {
            return "Includes all your favourites";
        }

        if (topItem.isPresent()) {
            String itemName = topItem.get().getName();
            // Truncate long names
            if (itemName.length() > 18) itemName = itemName.substring(0, 16) + "…";
            if (isFromFavCanteen) {
                return "Your go-to " + itemName + " combo";
            }
            return "Includes your fav " + itemName;
        }

        if (isFromFavCanteen) {
            return canteenRepository.findById(deal.getCanteenId())
                    .map(c -> "Top deal at " + c.getCanteenName())
                    .orElse("Top deal at your canteen");
        }

        return "Matches your recent orders";
    }

    // ── Gemini API Communication ──

    private String buildUserContext(List<Order> recentOrders) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("User's recent orders (last 7 days):\n");

        Map<String, Double> canteenSpending = new HashMap<>();
        Map<String, Integer> itemFrequency = new HashMap<>();
        double totalSpend = 0;

        for (Order order : recentOrders) {
            for (Order.OrderItem item : order.getOrderItems()) {
                String canteenId = item.getCanteenId();
                double itemTotal = item.getPrice() * item.getQuantity();
                canteenSpending.merge(canteenId, itemTotal, Double::sum);
                itemFrequency.merge(item.getName(), item.getQuantity(), Integer::sum);
                totalSpend += itemTotal;
            }
        }

        ctx.append("- Total spent this week: Rs. ").append(String.format("%.0f", totalSpend)).append("\n");
        ctx.append("- Most ordered items (MUST prioritize matching these):\n");
        itemFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .forEach(e -> ctx.append("  • ").append(e.getKey())
                        .append(" (").append(e.getValue()).append("x)\n"));

        ctx.append("- Frequently visited canteens:\n");
        for (Map.Entry<String, Double> entry : canteenSpending.entrySet()) {
            canteenRepository.findById(entry.getKey()).ifPresent(canteen ->
                    ctx.append("  • ").append(canteen.getCanteenName())
                            .append(" (Spent Rs. ").append(String.format("%.0f", entry.getValue())).append(")\n"));
        }

        return ctx.toString();
    }

    private String buildComboContext(List<ComboDeal> activeDeals) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("Available combo deals to choose from:\n");

        for (ComboDeal deal : activeDeals) {
            ctx.append("\n[COMBO_ID: ").append(deal.getId()).append("]\n");
            ctx.append("  Name: ").append(deal.getName()).append("\n");
            ctx.append("  Items: ").append(deal.getItems().stream()
                    .map(item -> item.getName())
                    .collect(Collectors.joining(", "))).append("\n");
            
            canteenRepository.findById(deal.getCanteenId())
                    .ifPresent(canteen -> ctx.append("  Canteen: ").append(canteen.getCanteenName()).append("\n"));
        }

        return ctx.toString();
    }

    private String callGeminiForRecommendations(String userContext, String comboContext) {
        String systemPrompt = "You are a highly selective food recommendation AI for CampusEats.\n\n" +
                "## Your Mission\n" +
                "Analyze user history and available deals. ONLY recommend items that are TRULY relevant to the user.\n" +
                "If no deals are highly relevant, return an empty array [].\n\n" +
                "## Selective Criteria\n" +
                "- Prioritize combos with items the user has ordered before.\n" +
                "- Prioritize combos from canteens the user visits frequently.\n" +
                "- If a combo is just 'good' but not specifically relevant to THIS user's history, assign it a low score.\n" +
                "- Provide a 4-6 word reason highlighting EXACTLY why it's relevant (e.g., 'Matches your favorite snack', 'Top combo at [Canteen Name]').\n\n" +
                "## Response Format\n" +
                "Return a JSON array of objects with fields: comboId, reason, relevanceScore (0-100).\n" +
                "Example: [{\"comboId\": \"id1\", \"reason\": \"Matches your chicken pasta habit\", \"relevanceScore\": 85}]\n\n" +
                "IMPORTANT: Return ONLY the JSON array. No text, no markdown.";

        String userMessage = userContext + "\n\n" + comboContext;

        // Build request body
        Map<String, Object> request = new HashMap<>();

        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
        request.put("system_instruction", systemInstruction);

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(Map.of("text", userMessage)));
        request.put("contents", List.of(userContent));

        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", 0.2); // Lower temperature for more consistent, logical relevance
        genConfig.put("maxOutputTokens", 1000);
        request.put("generationConfig", genConfig);

        // Call the API
        String responseJson = webClient.post()
                .uri(GEMINI_API_URL + "?key=" + geminiRecommendationApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Parse Gemini response
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode parts = root.path("candidates").get(0).path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText();
            }
        } catch (Exception e) {}

        throw new RuntimeException("Gemini API error");
    }

    private List<GeminiRecommendation> parseGeminiResponse(String responseText) {
        List<GeminiRecommendation> recommendations = new ArrayList<>();
        try {
            String cleaned = responseText.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
            }
            JsonNode arrayNode = objectMapper.readTree(cleaned);
            if (arrayNode.isArray()) {
                for (JsonNode node : arrayNode) {
                    recommendations.add(new GeminiRecommendation(
                            node.path("comboId").asText(),
                            node.path("reason").asText(),
                            node.path("relevanceScore").asInt(0)));
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini recommendations: {}", e.getMessage());
        }
        return recommendations;
    }

    // ── Helpers ──

    private boolean isCurrentlyValid(ComboDeal deal) {
        LocalDateTime now = LocalDateTime.now();
        if (deal.getValidFrom() != null && now.isBefore(deal.getValidFrom()))
            return false;
        if (deal.getValidUntil() != null && now.isAfter(deal.getValidUntil()))
            return false;
        return true;
    }

    private ComboDealResponse convertToResponse(ComboDeal deal, String recommendationReason) {
        ComboDealResponse response = new ComboDealResponse();
        response.setId(deal.getId());
        response.setCanteenId(deal.getCanteenId());
        response.setName(deal.getName());
        response.setDescription(deal.getDescription());
        response.setImageUrl(deal.getImageUrl());
        response.setCategory(deal.getCategory());
        response.setOriginalPrice(deal.getOriginalPrice());
        response.setComboPrice(deal.getComboPrice());
        response.setDiscountPercent(deal.getDiscountPercent());
        response.setActive(deal.isActive());
        response.setValidFrom(deal.getValidFrom());
        response.setValidUntil(deal.getValidUntil());
        response.setMinWeeklySpend(deal.getMinWeeklySpend());
        response.setRecommended(false);
        response.setRecommendationReason(recommendationReason);
        response.setCreatedAt(deal.getCreatedAt());

        // Resolve canteen name
        canteenRepository.findById(deal.getCanteenId())
                .ifPresent(canteen -> response.setCanteenName(canteen.getCanteenName()));

        // Convert combo items
        List<ComboDealResponse.ComboItemResponse> itemResponses = deal.getItems().stream()
                .map(item -> {
                    ComboDealResponse.ComboItemResponse ir = new ComboDealResponse.ComboItemResponse();
                    ir.setMenuItemId(item.getMenuItemId());
                    ir.setName(item.getName());
                    ir.setPrice(item.getPrice());
                    ir.setQuantity(item.getQuantity());
                    ir.setImageUrl(item.getImageUrl());
                    return ir;
                })
                .collect(Collectors.toList());
        response.setItems(itemResponses);

        return response;
    }

    // Helper class for Gemini recommendations
    private static class GeminiRecommendation {
        final String comboId;
        final String reason;
        final int relevanceScore;

        GeminiRecommendation(String comboId, String reason, int relevanceScore) {
            this.comboId = comboId;
            this.reason = reason;
            this.relevanceScore = relevanceScore;
        }
    }
}
