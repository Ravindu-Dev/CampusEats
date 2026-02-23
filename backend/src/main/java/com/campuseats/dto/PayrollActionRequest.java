package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollActionRequest {
    private String notes; // For submission notes
    private String comments; // For review comments
}
