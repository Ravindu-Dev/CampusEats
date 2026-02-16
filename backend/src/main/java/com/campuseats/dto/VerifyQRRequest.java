package com.campuseats.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyQRRequest {

    @NotBlank(message = "Scanned data is required")
    private String scannedData; // The order ID from the QR code

    @NotBlank(message = "Canteen ID is required")
    private String canteenId; // To verify the order belongs to this canteen
}
