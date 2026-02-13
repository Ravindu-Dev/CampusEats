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

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userName;

    @Indexed
    private String orderId;

    @Indexed
    private String canteenId;

    private String canteenName;

    private Integer rating; // 1-5 stars

    private String comment;

    private List<String> orderItems = new ArrayList<>(); // Names of items ordered

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
