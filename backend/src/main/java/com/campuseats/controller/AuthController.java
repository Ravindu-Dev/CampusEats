package com.campuseats.controller;

import com.campuseats.dto.JwtResponse;
import com.campuseats.dto.LoginRequest;
import com.campuseats.dto.SignupRequest;
import com.campuseats.model.User;
import com.campuseats.repository.UserRepository;
import com.campuseats.security.JwtTokenProvider;
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

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getPhoneNumber(),
                user.getProfilePhotoUrl(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
            }
            String expiredToken = authHeader.substring(7);
            String username = tokenProvider.getUsernameFromExpiredToken(expiredToken);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newToken = tokenProvider.generateTokenFromUsername(username);

            return ResponseEntity.ok(new JwtResponse(
                    newToken,
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getPhoneNumber(),
                    user.getProfilePhotoUrl(),
                    user.getCreatedAt() != null ? user.getCreatedAt().toString() : null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token refresh failed");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setPhoneNumber(signupRequest.getPhoneNumber());
        user.setAddress(signupRequest.getAddress());

        Set<String> roles = new HashSet<>();
        roles.add("USER");
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }
}
