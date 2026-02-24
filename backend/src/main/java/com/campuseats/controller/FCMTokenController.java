package com.campuseats.controller;

import com.campuseats.dto.FCMTokenRequest;
import com.campuseats.model.FCMToken;
import com.campuseats.model.User;
import com.campuseats.repository.FCMTokenRepository;
import com.campuseats.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
@Slf4j
public class FCMTokenController {

    private final FCMTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> registerToken(@Valid @RequestBody FCMTokenRequest request) {
        try {
            String userId = getCurrentUserId();

            // Check if token already exists
            Optional<FCMToken> existingToken = fcmTokenRepository.findByToken(request.getToken());
            if (existingToken.isPresent()) {
                // Update userId if token exists but belongs to different user
                FCMToken token = existingToken.get();
                if (!token.getUserId().equals(userId)) {
                    token.setUserId(userId);
                    fcmTokenRepository.save(token);
                }
                return ResponseEntity.ok(Map.of("message", "Token already registered"));
            }

            // Create new token entry
            FCMToken fcmToken = new FCMToken();
            fcmToken.setUserId(userId);
            fcmToken.setToken(request.getToken());
            fcmTokenRepository.save(fcmToken);

            log.info("FCM token registered for user {}", userId);
            return ResponseEntity.ok(Map.of("message", "Token registered successfully"));

        } catch (Exception e) {
            log.error("Failed to register FCM token: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to register token"));
        }
    }

    @DeleteMapping("/unregister")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> unregisterToken(@Valid @RequestBody FCMTokenRequest request) {
        try {
            fcmTokenRepository.deleteByToken(request.getToken());
            log.info("FCM token unregistered");
            return ResponseEntity.ok(Map.of("message", "Token unregistered successfully"));
        } catch (Exception e) {
            log.error("Failed to unregister FCM token: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to unregister token"));
        }
    }
}
