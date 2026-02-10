package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanteenOwnerResponse {
    private String token;
    private String email;
    private String ownerName;
    private String canteenId;
    private String canteenName;
    private String canteenStatus;
}
