package com.campuseats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private String id;
    private String staffId;
    private String staffName;
    private String canteenId;
    private LocalDate date;
    private String checkInTime;
    private String checkOutTime;
    private Double totalHours;
    private Double overtimeHours;
    private String dayType;
    private String notes;
    private LocalDateTime createdAt;
}
