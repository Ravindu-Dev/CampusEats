package com.campuseats.controller;

import com.campuseats.dto.LoyaltyAccountResponse;
import com.campuseats.dto.RedeemPointsRequest;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserRepository userRepository;

    @GetMapping("/account")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LoyaltyAccountResponse> getAccount() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(loyaltyService.getAccount(userId));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> redeemPoints(@Valid @RequestBody RedeemPointsRequest request) {
        try {
            String userId = getCurrentUserId();
            Double discount = loyaltyService.redeemPoints(userId, request.getPoints());
            return ResponseEntity.ok(Map.of(
                    "discount", discount,
                    "message", "Successfully redeemed " + request.getPoints() + " points for Rs. " + discount.intValue()
                            + " discount"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/spending")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Double>> getWeeklySpending() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(loyaltyService.getWeeklySpending(userId));
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
