package com.campuseats.controller;

import com.campuseats.dto.CreateStaffRequest;
import com.campuseats.dto.StaffResponse;
import com.campuseats.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody CreateStaffRequest request) {
        try {
            StaffResponse staff = staffService.createStaff(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<?> getStaffByCanteen(@PathVariable String canteenId) {
        try {
            List<StaffResponse> staff = staffService.getStaffByCanteen(canteenId);
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}/active")
    public ResponseEntity<?> getActiveStaffByCanteen(@PathVariable String canteenId) {
        try {
            List<StaffResponse> staff = staffService.getActiveStaffByCanteen(canteenId);
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}/count")
    public ResponseEntity<?> getActiveStaffCount(@PathVariable String canteenId) {
        try {
            long count = staffService.getActiveStaffCount(canteenId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable String id, @RequestBody CreateStaffRequest request) {
        try {
            StaffResponse staff = staffService.updateStaff(id, request);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStaffStatus(@PathVariable String id, @RequestParam String status) {
        try {
            StaffResponse staff = staffService.updateStaffStatus(id, status);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable String id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.ok("Staff member deactivated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
