package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "combo_deals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboDeal {

    @Id
    private String id;

    @Indexed
    private String canteenId;

    private String name;
    private String description;
    private String imageUrl;
    private String category; // e.g. "Lunch Combo", "Breakfast Combo", "Snack Combo"

    private List<ComboItem> items = new ArrayList<>();

    private Double originalPrice; // sum of individual item prices
    private Double comboPrice; // discounted price
    private Double discountPercent;

    private boolean active = true;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    // Minimum weekly spending at this canteen to recommend this combo (default Rs.
    // 5000)
    private Double minWeeklySpend = 5000.0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComboItem {
        private String menuItemId;
        private String name;
        private Double price;
        private Integer quantity;
        private String imageUrl;
    }
}
