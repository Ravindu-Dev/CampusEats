package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payroll_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollConfig {

    @Id
    private String id;

    private String payPeriodType = "MONTHLY"; // MONTHLY, BI_WEEKLY, WEEKLY
    private Double overtimeMultiplier = 1.5;
    private Double epfEmployeeRate = 8.0; // % deducted from employee
    private Double epfEmployerRate = 12.0; // % contributed by employer
    private Double etfRate = 3.0; // % contributed by employer
    private Integer standardWorkHoursPerDay = 8;
    private Double defaultMealAllowance = 0.0;
    private Double defaultTransportAllowance = 0.0;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String updatedBy; // Admin ID
}
