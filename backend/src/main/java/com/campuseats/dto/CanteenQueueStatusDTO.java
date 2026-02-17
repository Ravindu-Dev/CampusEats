package com.campuseats.dto;

import com.campuseats.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanteenQueueStatusDTO {
    private String canteenId;
    private String canteenName;
    private String queueStatus; // HIGH, MEDIUM, LOW, NONE
    private Integer pendingOrderCount;
    private Map<Order.OrderType, Integer> ordersByType;
}
