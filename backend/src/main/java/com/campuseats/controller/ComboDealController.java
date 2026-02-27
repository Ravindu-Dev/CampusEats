package com.campuseats.controller;

import com.campuseats.dto.ComboDealRequest;
import com.campuseats.dto.ComboDealResponse;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.service.ComboDealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combo-deals")
@RequiredArgsConstructor
public class ComboDealController {

    private final ComboDealService comboDealService;
    private final UserRepository userRepository;

    // ── Public Endpoints ──

    @GetMapping("/all")
    public ResponseEntity<List<ComboDealResponse>> getAllActiveComboDeals() {
        return ResponseEntity.ok(comboDealService.getAllActiveComboDeals());
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<List<ComboDealResponse>> getCanteenComboDeals(@PathVariable String canteenId) {
        return ResponseEntity.ok(comboDealService.getCanteenComboDeals(canteenId));
    }

    // ── User Endpoints ──

    @GetMapping("/recommended")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ComboDealResponse>> getRecommendedCombos() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(comboDealService.getRecommendedCombos(userId));
    }

    // ── Canteen Owner Endpoints ──

    @PostMapping
    @PreAuthorize("hasRole('CANTEEN_OWNER')")
    public ResponseEntity<ComboDealResponse> createComboDeal(
            @Valid @RequestBody ComboDealRequest request,
            @RequestParam String canteenId) {
        return ResponseEntity.ok(comboDealService.createComboDeal(canteenId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CANTEEN_OWNER')")
    public ResponseEntity<ComboDealResponse> updateComboDeal(
            @PathVariable String id,
            @Valid @RequestBody ComboDealRequest request,
            @RequestParam String canteenId) {
        return ResponseEntity.ok(comboDealService.updateComboDeal(id, canteenId, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANTEEN_OWNER')")
    public ResponseEntity<?> deleteComboDeal(
            @PathVariable String id,
            @RequestParam String canteenId) {
        try {
            comboDealService.deleteComboDeal(id, canteenId);
            return ResponseEntity.ok(Map.of("message", "Combo deal deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Helper ──

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
