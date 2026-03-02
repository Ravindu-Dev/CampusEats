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
    private String profilePicture;

    public JwtResponse(String token, String username, String email, String profilePicture) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.profilePicture = profilePicture;
    }
}
