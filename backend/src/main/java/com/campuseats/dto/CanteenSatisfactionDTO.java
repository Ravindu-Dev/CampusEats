package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanteenSatisfactionDTO {
    private String canteenId;
    private String canteenName;
    private Double averageRating;
    private Long reviewCount;
}
