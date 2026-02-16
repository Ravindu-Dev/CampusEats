package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private String id;
    private String userId;
    private List<OrderItemDTO> orderItems;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String pickupDate;
    private String pickupTime;
    private Double totalAmount;
    private String paymentStatus;
    private String stripePaymentIntentId;
    private String qrCodeBase64;
    private String orderStatus;
    private Boolean hasReview;
    private LocalDateTime preparedAt;
    private LocalDateTime readyAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private String menuItemId;
        private String name;
        private Double price;
        private Integer quantity;
        private String canteenId;
        private String canteenName;
        private String imageUrl;
    }
}
