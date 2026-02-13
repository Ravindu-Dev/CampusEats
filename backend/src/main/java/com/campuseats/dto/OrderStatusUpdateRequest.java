package com.campuseats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "PENDING|PREPARING|READY|COMPLETED", message = "Invalid status")
    private String status;
}
