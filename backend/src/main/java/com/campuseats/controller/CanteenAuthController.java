package com.campuseats.controller;

import com.campuseats.dto.CanteenOwnerLoginRequest;
import com.campuseats.dto.CanteenOwnerResponse;
import com.campuseats.dto.CanteenRegistrationRequest;
import com.campuseats.model.Canteen;
import com.campuseats.model.CanteenOwner;
import com.campuseats.repository.CanteenOwnerRepository;
import com.campuseats.repository.CanteenRepository;
import com.campuseats.security.JwtTokenProvider;
import com.campuseats.service.CanteenOwnerService;
import com.campuseats.service.CanteenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canteen-auth")
@RequiredArgsConstructor
public class CanteenAuthController {

    private final AuthenticationManager authenticationManager;
    private final CanteenOwnerRepository canteenOwnerRepository;
    private final CanteenRepository canteenRepository;
    private final CanteenService canteenService;
    private final CanteenOwnerService canteenOwnerService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> registerCanteen(@Valid @RequestBody CanteenRegistrationRequest request) {
        try {
            // Validate that email is not already taken
            if (canteenOwnerRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Error: Email is already registered!");
            }

            if (canteenRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Error: Email is already used by another canteen!");
            }

            // Create CanteenOwner
            CanteenOwner owner = new CanteenOwner();
            owner.setOwnerName(request.getOwnerName());
            owner.setEmail(request.getEmail());
            owner.setPassword(passwordEncoder.encode(request.getPassword()));
            owner.setPhoneNumber(request.getPhoneNumber());
            owner.setEnabled(true);

            CanteenOwner savedOwner = canteenOwnerService.createCanteenOwner(owner);

            // Create Canteen
            Canteen canteen = new Canteen();
            canteen.setCanteenName(request.getCanteenName());
            canteen.setOwnerName(request.getOwnerName());
            canteen.setEmail(request.getEmail());
            canteen.setPhoneNumber(request.getPhoneNumber());
            canteen.setAlternativeContactNumber(request.getAlternativeContactNumber());

            // Location
            canteen.setCampus(request.getCampus());
            canteen.setLocation(request.getLocation());
            canteen.setFloorNumber(request.getFloorNumber());
            canteen.setRoomNumber(request.getRoomNumber());
            canteen.setLandmark(request.getLandmark());

            // Operational details
            canteen.setOpeningTime(request.getOpeningTime());
            canteen.setClosingTime(request.getClosingTime());
            canteen.setOperatingDays(request.getOperatingDays());
            canteen.setAveragePreparationTime(request.getAveragePreparationTime());
            canteen.setDeliveryAvailable(request.isDeliveryAvailable());
            canteen.setPickupAvailable(request.isPickupAvailable());
            canteen.setSeatingCapacity(request.getSeatingCapacity());

            // Description & categories
            canteen.setDescription(request.getDescription());
            canteen.setCuisineTypes(request.getCuisineTypes());
            canteen.setSpecialtyItems(request.getSpecialtyItems());
            canteen.setDietaryOptions(request.getDietaryOptions());

            // Business information
            canteen.setBusinessRegistrationNumber(request.getBusinessRegistrationNumber());
            canteen.setGstNumber(request.getGstNumber());
            canteen.setFoodSafeLicenseNumber(request.getFoodSafeLicenseNumber());

            // Payment & banking
            canteen.setBankName(request.getBankName());
            canteen.setAccountHolderName(request.getAccountHolderName());
            canteen.setAccountNumber(request.getAccountNumber());
            canteen.setIfscCode(request.getIfscCode());
            canteen.setUpiId(request.getUpiId());
            canteen.setAcceptedPaymentMethods(request.getAcceptedPaymentMethods());

            // Social & web
            canteen.setWebsiteUrl(request.getWebsiteUrl());
            canteen.setInstagramHandle(request.getInstagramHandle());
            canteen.setFacebookPage(request.getFacebookPage());

            // Logo
            canteen.setLogoUrl(request.getLogoUrl());

            // Set owner reference
            canteen.setOwnerId(savedOwner.getId());

            // Set initial status
            canteen.setStatus("PENDING");
            canteen.setActive(true);

            Canteen savedCanteen = canteenService.createCanteen(canteen);

            // Update owner with canteen reference
            savedOwner.setCanteenId(savedCanteen.getId());
            canteenOwnerService.createCanteenOwner(savedOwner);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Canteen registered successfully! Your registration is pending admin approval. You will be able to log in once approved.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateCanteenOwner(@Valid @RequestBody CanteenOwnerLoginRequest loginRequest) {
        try {
            // Find the canteen owner
            CanteenOwner owner = canteenOwnerRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            // Check approval status
            if ("PENDING".equals(owner.getApprovalStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your registration is pending admin approval. Please wait for approval.");
            }

            if ("REJECTED".equals(owner.getApprovalStatus())) {
                String message = "Your registration has been rejected.";
                if (owner.getRejectionReason() != null && !owner.getRejectionReason().isEmpty()) {
                    message += " Reason: " + owner.getRejectionReason();
                }
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
            }

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            // Get canteen details
            Canteen canteen = null;
            String canteenName = null;
            String canteenStatus = null;

            if (owner.getCanteenId() != null) {
                canteen = canteenRepository.findById(owner.getCanteenId()).orElse(null);
                if (canteen != null) {
                    canteenName = canteen.getCanteenName();
                    canteenStatus = canteen.getStatus();
                }
            }

            CanteenOwnerResponse response = new CanteenOwnerResponse(
                    jwt,
                    owner.getEmail(),
                    owner.getOwnerName(),
                    owner.getCanteenId(),
                    canteenName,
                    canteenStatus,
                    owner.getApprovalStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        }
    }
}
