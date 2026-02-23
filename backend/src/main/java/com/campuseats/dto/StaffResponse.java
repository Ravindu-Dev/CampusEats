package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponse {
    private String id;
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
    private LocalDate joinDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
