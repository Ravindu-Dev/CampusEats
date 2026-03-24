package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long activeUsers;
    private CanteenPerformanceDTO topCanteen;
    private List<RevenueTrendDTO> revenueTrend;
    private List<UserGrowthDTO> userGrowth;
    private List<CanteenPerformanceDTO> topCanteens;
    private List<String> insights;
}
