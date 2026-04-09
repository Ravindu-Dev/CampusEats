package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPerformanceDTO {
    private String productName;
    private Long totalSold;
    private Double revenue;
    private String canteenName;
}
