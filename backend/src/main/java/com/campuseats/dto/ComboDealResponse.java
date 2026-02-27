package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboDealResponse {
    private String id;
    private String canteenId;
    private String canteenName;
    private String name;
    private String description;
    private String imageUrl;
    private String category;
    private List<ComboItemResponse> items;
    private Double originalPrice;
    private Double comboPrice;
    private Double discountPercent;
    private boolean active;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Double minWeeklySpend;
    private boolean recommended; // whether this combo is specifically recommended for the user
    private String recommendationReason;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComboItemResponse {
        private String menuItemId;
        private String name;
        private Double price;
        private Integer quantity;
        private String imageUrl;
    }
}
