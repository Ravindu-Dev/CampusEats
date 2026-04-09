package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FulfillmentStatsDTO {
    // Average minutes from order placed → READY
    private Double avgWaitMinutes;
    // Average minutes from READY → COMPLETED (pickup delay)
    private Double avgPickupDelayMinutes;
    // Count of orders used in the calculation
    private Long sampleCount;
}
