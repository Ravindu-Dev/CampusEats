package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffRequest {
    private String canteenId;
    private String staffName;
    private String role;
    private String phone;
    private String nicNumber;
    private String employmentType;
    private String payType;
    private Double payRate;
    private String bankName;
    private String accountNumber;
    private String bankBranch;
    private String joinDate; // ISO date string
}
