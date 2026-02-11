package com.campuseats.controller;

import com.campuseats.dto.AdminLoginRequest;
import com.campuseats.dto.AdminResponse;
import com.campuseats.model.Admin;
import com.campuseats.repository.AdminRepository;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAdmin(@Valid @RequestBody AdminLoginRequest loginRequest) {
        try {
            // Find the admin
            Admin admin = adminRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            AdminResponse response = new AdminResponse(
                    jwt,
                    admin.getEmail(),
                    admin.getName(),
                    "ADMIN");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid email or password");
        }
    }

    @PostMapping("/init")
    public ResponseEntity<?> initializeAdmin() {
        try {
            // Check if admin already exists
            if (adminRepository.existsByEmail("admin@campuseats.com")) {
                return ResponseEntity.badRequest().body("Admin already exists!");
            }

            // Create default admin
            Admin admin = new Admin();
            admin.setName("System Administrator");
            admin.setEmail("admin@campuseats.com");
            admin.setPassword(passwordEncoder.encode("admin123"));

            Set<String> roles = new HashSet<>();
            roles.add("ADMIN");
            admin.setRoles(roles);
            admin.setEnabled(true);

            adminRepository.save(admin);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Admin initialized successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
