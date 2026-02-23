package com.campuseats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    private String id;

    @Indexed
    private String canteenId;

    private String staffName;
    private String role; // COOK, HELPER, CASHIER, CLEANER, DELIVERY
    private String phone;
    private String nicNumber; // National ID
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT
    private String payType; // HOURLY, MONTHLY
    private Double payRate; // Amount per hour or monthly salary (LKR)

    // Bank Details
    private String bankName;
    private String accountNumber;
    private String bankBranch;

    private LocalDate joinDate;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, TERMINATED

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
