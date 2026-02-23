package com.campuseats.controller;

import com.campuseats.dto.AttendanceRequest;
import com.campuseats.dto.AttendanceResponse;
import com.campuseats.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<?> logAttendance(@RequestBody AttendanceRequest request) {
        try {
            AttendanceResponse response = attendanceService.logAttendance(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> logBulkAttendance(@RequestBody AttendanceRequest.BulkAttendanceRequest request) {
        try {
            List<AttendanceResponse> responses = attendanceService.logBulkAttendance(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}")
    public ResponseEntity<?> getAttendanceByCanteen(
            @PathVariable String canteenId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<AttendanceResponse> responses = attendanceService.getAttendanceByCanteen(
                    canteenId, startDate, endDate);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/canteen/{canteenId}/date/{date}")
    public ResponseEntity<?> getAttendanceByCanteenAndDate(
            @PathVariable String canteenId,
            @PathVariable String date) {
        try {
            List<AttendanceResponse> responses = attendanceService.getAttendanceByCanteenAndDate(
                    canteenId, date);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getAttendanceByStaff(
            @PathVariable String staffId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<AttendanceResponse> responses = attendanceService.getAttendanceByStaff(
                    staffId, startDate, endDate);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}
