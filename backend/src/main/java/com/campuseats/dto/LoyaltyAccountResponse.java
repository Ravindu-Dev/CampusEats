package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAccountResponse {
    private String userId;
    private Integer totalPoints;
    private Integer lifetimePoints;
    private String tier;
    private String nextTier;
    private Integer pointsToNextTier;
    private Map<String, Double> weeklySpending;
    private Double totalWeeklySpending;
    private List<TransactionResponse> recentTransactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private String type;
        private Integer points;
        private String orderId;
        private String description;
        private LocalDateTime timestamp;
    }
}
