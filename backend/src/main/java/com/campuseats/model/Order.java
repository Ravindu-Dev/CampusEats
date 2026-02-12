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
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed
    private String userId;

    private List<OrderItem> orderItems = new ArrayList<>();

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String pickupDate;
    private String pickupTime;

    private Double totalAmount;

    // Payment status: "pending", "succeeded", "failed"
    private String paymentStatus;

    private String stripePaymentIntentId;

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String menuItemId;
        private String name;
        private Double price;
        private Integer quantity;
        private String canteenId;
        private String canteenName;
        private String imageUrl;
    }
}
