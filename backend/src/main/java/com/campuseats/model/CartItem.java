package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    private String menuItemId;
    private String name;
    private Double price;
    private Integer quantity;
    private String imageUrl;
    private String canteenId;
    private String canteenName;
    private String category;
    private boolean vegetarian;
}
