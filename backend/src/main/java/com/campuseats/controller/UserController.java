package com.campuseats.controller;

import com.campuseats.dto.UserProfileUpdateRequest;
import com.campuseats.dto.UserResponse;
import com.campuseats.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateUserProfile(
            Authentication authentication,
            @RequestBody UserProfileUpdateRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateUserProfile(username, request));
    }
}
