package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollConfigRequest {
    private String payPeriodType;
    private Double overtimeMultiplier;
    private Double epfEmployeeRate;
    private Double epfEmployerRate;
    private Double etfRate;
    private Integer standardWorkHoursPerDay;
    private Double defaultMealAllowance;
    private Double defaultTransportAllowance;
}
