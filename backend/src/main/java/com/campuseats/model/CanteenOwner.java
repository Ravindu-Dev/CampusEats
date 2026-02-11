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

@Document(collection = "canteen_owners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanteenOwner {

    @Id
    private String id;

    // Owner Personal Details
    private String ownerName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;

    // Authentication
    private String password; // Encrypted

    // Canteen Reference
    @Indexed
    private String canteenId; // Reference to Canteen entity

    // Account Status
    private boolean enabled = true;
    private boolean emailVerified = false;

    // Approval Workflow
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED
    private String approvedBy; // Admin ID who approved/rejected
    private LocalDateTime approvedAt; // When the decision was made
    private String rejectionReason; // Reason for rejection (optional)

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
