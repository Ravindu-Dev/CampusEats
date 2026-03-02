package com.campuseats.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String profilePicture;
}
