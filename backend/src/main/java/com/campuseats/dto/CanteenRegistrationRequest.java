package com.campuseats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanteenRegistrationRequest {

    // Owner Account Details
    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @jakarta.validation.constraints.Pattern(
        regexp = "^[a-zA-Z0-9._%+-]+@+[a-zA-Z0-9.-]+\\.com$",
        message = "Invalid email format. Only .com addresses are allowed."
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @jakarta.validation.constraints.Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    private String password;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String alternativeContactNumber;

    // Canteen Basic Details
    @NotBlank(message = "Canteen name is required")
    private String canteenName;

    @NotBlank(message = "Location is required")
    private String location;

    private String campus;
    private String floorNumber;
    private String roomNumber;
    private String landmark;

    @NotBlank(message = "Description is required")
    private String description;

    // Operational Details
    @NotBlank(message = "Opening time is required")
    private String openingTime; // Will be parsed to LocalTime

    @NotBlank(message = "Closing time is required")
    private String closingTime; // Will be parsed to LocalTime

    private Set<String> operatingDays;
    private Integer averagePreparationTime;
    private boolean deliveryAvailable;
    private boolean pickupAvailable;
    private Integer seatingCapacity;

    // Business Information
    private String businessRegistrationNumber;
    private String gstNumber;
    private String foodSafeLicenseNumber;

    // Categories
    private Set<String> cuisineTypes;
    private String specialtyItems;
    private Set<String> dietaryOptions;

    // Payment & Banking
    private String bankName;
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;
    private Set<String> acceptedPaymentMethods;

    // Social & Web
    private String websiteUrl;
    private String instagramHandle;
    private String facebookPage;
    @NotBlank(message = "Logo URL is required")
    private String logoUrl;
}
