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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "loyalty_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAccount {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Integer totalPoints = 0;
    private Integer lifetimePoints = 0;

    private LoyaltyTier tier = LoyaltyTier.BRONZE;

    // Weekly spending tracking: canteenId -> amount spent this week
    private Map<String, Double> weeklySpending = new HashMap<>();
    private LocalDateTime weekStart;

    // Recent transaction history (embedded, kept to last 50)
    private List<LoyaltyTransaction> transactions = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum LoyaltyTier {
        BRONZE, // 0+ lifetime points
        SILVER, // 500+ lifetime points
        GOLD, // 2000+ lifetime points
        PLATINUM // 5000+ lifetime points
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyTransaction {
        private String type; // EARN, REDEEM
        private Integer points;
        private String orderId;
        private String description;
        private LocalDateTime timestamp;
    }
}
