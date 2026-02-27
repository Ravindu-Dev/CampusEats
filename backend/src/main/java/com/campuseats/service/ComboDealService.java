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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComboDealService {

    private final ComboDealRepository comboDealRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final CanteenRepository canteenRepository;

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

    // ── Recommendation Engine ──

    public List<ComboDealResponse> getRecommendedCombos(String userId) {
        // 1. Get user's orders from the past 7 days
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Order> recentOrders = orderRepository.findByUserIdAndPaymentStatusAndCreatedAtAfter(
                userId, "succeeded", weekAgo);

        // 2. Calculate per-canteen spending
        Map<String, Double> canteenSpending = new HashMap<>();
        Map<String, Integer> itemFrequency = new HashMap<>(); // menuItemId -> order count

        for (Order order : recentOrders) {
            for (Order.OrderItem item : order.getOrderItems()) {
                String cid = item.getCanteenId();
                canteenSpending.merge(cid, item.getPrice() * item.getQuantity(), Double::sum);
                itemFrequency.merge(item.getMenuItemId(), item.getQuantity(), Integer::sum);
            }
        }

        // 3. Get all active combo deals
        List<ComboDeal> activeDeals = comboDealRepository.findByActiveTrue().stream()
                .filter(this::isCurrentlyValid)
                .collect(Collectors.toList());

        // 4. Score and filter combos
        List<ScoredDeal> scoredDeals = new ArrayList<>();

        for (ComboDeal deal : activeDeals) {
            double score = 0;
            String reason = null;

            // Check spending threshold
            Double userSpendingAtCanteen = canteenSpending.getOrDefault(deal.getCanteenId(), 0.0);

            if (userSpendingAtCanteen >= deal.getMinWeeklySpend()) {
                score += 50; // High priority: user is a frequent spender at this canteen
                reason = "Based on your Rs. " + String.format("%.0f", userSpendingAtCanteen) + " weekly spending";
            }

            // Check if combo contains frequently ordered items
            int matchingItems = 0;
            for (ComboDeal.ComboItem comboItem : deal.getItems()) {
                if (itemFrequency.containsKey(comboItem.getMenuItemId())) {
                    matchingItems++;
                    score += 10 * itemFrequency.get(comboItem.getMenuItemId());
                }
            }

            if (matchingItems > 0 && reason == null) {
                reason = "Contains " + matchingItems + " of your favorite items";
            }

            // Bonus for higher discount
            score += deal.getDiscountPercent() != null ? deal.getDiscountPercent() : 0;

            if (score > 0) {
                scoredDeals.add(new ScoredDeal(deal, score, reason != null ? reason : "Special deal for you"));
            }
        }

        // 5. Sort by score (best recommendations first) and limit
        scoredDeals.sort((a, b) -> Double.compare(b.score, a.score));

        return scoredDeals.stream()
                .limit(10)
                .map(sd -> {
                    ComboDealResponse response = convertToResponse(sd.deal, null);
                    response.setRecommended(true);
                    response.setRecommendationReason(sd.reason);
                    return response;
                })
                .collect(Collectors.toList());
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

    // Helper class for scoring recommendations
    private static class ScoredDeal {
        final ComboDeal deal;
        final double score;
        final String reason;

        ScoredDeal(ComboDeal deal, double score, String reason) {
            this.deal = deal;
            this.score = score;
            this.reason = reason;
        }
    }
}
