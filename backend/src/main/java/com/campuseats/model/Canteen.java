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
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "canteens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Canteen {

    @Id
    private String id;

    // Basic Details
    private String canteenName;
    private String ownerName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;
    private String alternativeContactNumber;

    // Business Information
    private String businessRegistrationNumber;
    private String gstNumber;
    private String foodSafeLicenseNumber;

    // Location & Address
    private String campus;
    private String location; // Building name
    private String floorNumber;
    private String roomNumber;
    private String landmark;

    // Operational Details
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Set<String> operatingDays = new HashSet<>(); // MON, TUE, WED, THU, FRI, SAT, SUN
    private Integer averagePreparationTime; // in minutes
    private boolean deliveryAvailable = false;
    private boolean pickupAvailable = true;
    private Integer seatingCapacity;

    // Description & Categories
    private String description;
    private Set<String> cuisineTypes = new HashSet<>(); // INDIAN, CHINESE, CONTINENTAL, BEVERAGES, etc.
    private String specialtyItems;
    private Set<String> dietaryOptions = new HashSet<>(); // VEGETARIAN, VEGAN, HALAL, etc.

    // Payment & Banking
    private String bankName;
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;
    private Set<String> acceptedPaymentMethods = new HashSet<>(); // CASH, CARD, UPI, WALLET

    // Uploads (file paths)
    private String logoUrl;
    private String bannerUrl;
    private List<String> galleryPaths = new ArrayList<>();
    private List<String> documentPaths = new ArrayList<>(); // License documents

    // Social & Web Presence
    private String websiteUrl;
    private String instagramHandle;
    private String facebookPage;

    // System Fields
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, SUSPENDED
    private boolean verified = false;
    private boolean active = true;
    private Double rating = 0.0;
    private Integer totalRatings = 0;

    @CreatedDate
    private LocalDateTime registrationDate;

    @LastModifiedDate
    private LocalDateTime lastUpdated;

    // Owner reference
    @Indexed
    private String ownerId; // Reference to CanteenOwner
}
