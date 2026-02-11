package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    private String id;

    @Indexed
    private String canteenId;

    private String name;
    private String description;
    private Double price;
    private String category; // e.g., Breakfast, Lunch, Dinner, Snacks, Beverages
    private String imageUrl;

    private boolean available = true;
    private boolean vegetarian = false;

    @LastModifiedDate
    private LocalDateTime lastUpdated;
}
