package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {
    private String staffId;
    private String canteenId;
    private String date; // ISO date string
    private String checkInTime; // HH:mm
    private String checkOutTime; // HH:mm
    private String dayType; // PRESENT, ABSENT, HALF_DAY, LEAVE
    private String notes;

    // For bulk attendance
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkAttendanceRequest {
        private String canteenId;
        private String date; // ISO date string
        private List<AttendanceEntry> entries;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceEntry {
        private String staffId;
        private String checkInTime;
        private String checkOutTime;
        private String dayType;
        private String notes;
    }
}
