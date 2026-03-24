package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanteenPerformanceDTO {
    private String canteenId;
    private String canteenName;
    private Long totalOrders;
    private Double revenue;
    private Double averageRating;
}
