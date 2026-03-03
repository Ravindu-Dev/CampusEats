package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private String email;
    private String firstName;
    private String phoneNumber;
    private String profilePhotoUrl;
    private String createdAt;

    public JwtResponse(String token, String username, String email, String firstName,
            String phoneNumber, String profilePhotoUrl, String createdAt) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
        this.profilePhotoUrl = profilePhotoUrl;
        this.createdAt = createdAt;
    }
}
