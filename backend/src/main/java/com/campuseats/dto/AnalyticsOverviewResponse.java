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
    // Existing fields
    private Double totalRevenue;
    private Long totalOrders;
    private Long activeUsers;
    private CanteenPerformanceDTO topCanteen;
    private List<RevenueTrendDTO> revenueTrend;
    private List<UserGrowthDTO> userGrowth;
    private List<CanteenPerformanceDTO> topCanteens;
    private List<String> insights;

    // Peak hours (hourly traffic)
    private List<HourlyDistributionDTO> hourlyDistribution;

    // Top selling products
    private List<ProductPerformanceDTO> topSellingProducts;
    private ProductPerformanceDTO bestSeller;

    // Quality & Sentiment
    private List<CanteenSatisfactionDTO> canteenSatisfaction;

    // Fulfillment & Kitchen Efficiency
    private FulfillmentStatsDTO fulfillmentStats;

    // Customer Retention
    private Double repeatOrderRate;   // percentage of users who ordered >1 time
    private Long atRiskCustomers;     // users who ordered before but not in last 10 days
}
