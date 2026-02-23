package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    private String id;

    @Indexed
    private String canteenId;

    private String canteenName;
    private String periodStart; // ISO date string
    private String periodEnd; // ISO date string
    private String periodType; // MONTHLY, BI_WEEKLY, WEEKLY

    // Status workflow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED / REJECTED
    private String status = "DRAFT";

    // Financial summary
    private Double totalGrossPay = 0.0;
    private Double totalDeductions = 0.0;
    private Double totalNetPay = 0.0;
    private Double totalEpfEmployer = 0.0;
    private Double totalEtfEmployer = 0.0;
    private Integer totalStaffCount = 0;

    // Embedded payroll items (one per staff)
    private List<PayrollItem> items = new ArrayList<>();

    // Submission info
    private String submittedBy;
    private LocalDateTime submittedAt;
    private String submissionNotes;

    // Review info
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewComments;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollItem {
        private String staffId;
        private String staffName;
        private String role;
        private String payType;
        private Double payRate;

        // Hours
        private Double totalHoursWorked = 0.0;
        private Double overtimeHours = 0.0;
        private Integer daysWorked = 0;
        private Integer daysAbsent = 0;

        // Pay breakdown
        private Double basicPay = 0.0;
        private Double overtimePay = 0.0;
        private Double mealAllowance = 0.0;
        private Double transportAllowance = 0.0;
        private Double grossPay = 0.0;

        // Deductions
        private Double epfEmployee = 0.0;
        private Double advanceDeductions = 0.0;
        private Double otherDeductions = 0.0;
        private Double totalDeductions = 0.0;

        // Net
        private Double netPay = 0.0;

        // Employer contributions (not deducted from employee)
        private Double epfEmployer = 0.0;
        private Double etfEmployer = 0.0;
    }
}
