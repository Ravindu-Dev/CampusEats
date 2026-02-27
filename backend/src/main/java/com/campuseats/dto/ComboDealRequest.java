package com.campuseats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboDealRequest {

    @NotBlank(message = "Combo name is required")
    private String name;

    private String description;
    private String imageUrl;
    private String category;

    @NotNull(message = "Items are required")
    private List<ComboItemDTO> items;

    @NotNull(message = "Combo price is required")
    @Positive(message = "Combo price must be positive")
    private Double comboPrice;

    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    private Double minWeeklySpend = 5000.0;
    private boolean active = true;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComboItemDTO {
        @NotBlank(message = "Menu item ID is required")
        private String menuItemId;
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
    }
}
