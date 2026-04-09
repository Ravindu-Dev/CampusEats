package com.campuseats.controller;

import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.repository.MenuItemRepository;
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
    private final MenuItemRepository menuItemRepository;

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

    @PostMapping("/favorites/{itemId}")
    public ResponseEntity<?> addFavorite(@PathVariable String itemId) {
        User user = getAuthenticatedUser();
        com.campuseats.model.MenuItem item = menuItemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Item not found"));
        }
        if (user.getFavoriteMenuItemIds() == null) {
            user.setFavoriteMenuItemIds(new HashSet<>());
        }
        user.getFavoriteMenuItemIds().add(itemId);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Added to favorites"));
    }

    @DeleteMapping("/favorites/{itemId}")
    public ResponseEntity<?> removeFavorite(@PathVariable String itemId) {
        User user = getAuthenticatedUser();
        if (user.getFavoriteMenuItemIds() != null) {
            user.getFavoriteMenuItemIds().remove(itemId);
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Removed from favorites"));
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites() {
        User user = getAuthenticatedUser();
        if (user.getFavoriteMenuItemIds() == null || user.getFavoriteMenuItemIds().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<com.campuseats.model.MenuItem> favorites = new ArrayList<>();
        user.getFavoriteMenuItemIds().forEach(id -> {
            menuItemRepository.findById(id).ifPresent(favorites::add);
        });
        return ResponseEntity.ok(favorites);
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
