package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private String id;
    private String userId;
    private String userName;
    private String orderId;
    private String canteenId;
    private String canteenName;
    private Integer rating;
    private String comment;
    private List<String> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
