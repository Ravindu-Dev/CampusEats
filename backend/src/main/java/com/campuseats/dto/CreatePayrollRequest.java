package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayrollRequest {
    private String canteenId;
    private String periodStart; // ISO date string
    private String periodEnd; // ISO date string
}
