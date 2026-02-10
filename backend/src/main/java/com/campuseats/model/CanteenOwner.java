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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
