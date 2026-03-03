package com.campuseats.controller;

import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;

    /**
     * GET /api/user/profile — returns the authenticated user's profile
     */
    @GetMapping
    public ResponseEntity<?> getProfile() {
        User user = getAuthenticatedUser();
        Map<String, Object> profile = buildProfileMap(user);
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/user/profile — updates profile fields (firstName, lastName,
     * phoneNumber, address, profilePhotoUrl)
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates) {
        User user = getAuthenticatedUser();

        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("phoneNumber")) {
            user.setPhoneNumber(updates.get("phoneNumber"));
        }
        if (updates.containsKey("address")) {
            user.setAddress(updates.get("address"));
        }
        if (updates.containsKey("profilePhotoUrl")) {
            String photoUrl = updates.get("profilePhotoUrl");
            user.setProfilePhotoUrl(photoUrl != null && !photoUrl.trim().isEmpty() ? photoUrl : null);
        }

        userRepository.save(user);

        Map<String, Object> profile = buildProfileMap(user);
        return ResponseEntity.ok(profile);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> buildProfileMap(User user) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("email", user.getEmail());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("address", user.getAddress());
        profile.put("profilePhotoUrl", user.getProfilePhotoUrl());
        profile.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return profile;
    }
}
